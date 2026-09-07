import { env } from 'cloudflare:workers';

/**
 * Admin auth is delegated to Cloudflare Access (Zero Trust). Access sits in
 * front of `/admin` and `/api/admin/*`, authenticates the visitor against the
 * policy configured in the dashboard, and forwards the request with a signed
 * JWT. This module does the other half of the contract: it verifies that JWT,
 * so a request that reaches the Worker without going through Access — a
 * preview deployment URL, a misconfigured route — is rejected rather than
 * trusted.
 *
 * Verifying is not optional. The header is attacker-controlled on any path
 * Access does not cover, so an unverified read of it would be no auth at all.
 */

/** Header Access adds to the origin request. Also mirrored in a cookie. */
const JWT_HEADER = 'Cf-Access-Jwt-Assertion';
const JWT_COOKIE = 'CF_Authorization';

/** Clock skew tolerance, in seconds, for `exp`/`nbf`/`iat`. */
const SKEW = 60;

/** JWKS cache lifetime per isolate. Access rotates signing keys periodically. */
const JWKS_TTL_MS = 60 * 60 * 1000;

interface AccessClaims {
  aud?: string | string[];
  email?: string;
  exp?: number;
  iat?: number;
  iss?: string;
  nbf?: number;
  sub?: string;
}

export interface AccessIdentity {
  email: string;
  sub: string;
}

interface JwksCache {
  keys: JsonWebKey[];
  fetchedAt: number;
}

let jwksCache: JwksCache | null = null;

function teamDomain(): string {
  return (env.CF_ACCESS_TEAM_DOMAIN ?? '').trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function audienceTag(): string {
  return (env.CF_ACCESS_AUD ?? '').trim();
}

/** True only when both Access settings are present. Missing config fails closed. */
export function isAccessConfigured(): boolean {
  return teamDomain() !== '' && audienceTag() !== '';
}

function base64UrlToBytes(input: string): Uint8Array<ArrayBuffer> {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function decodeJsonSegment<T>(segment: string): T | null {
  try {
    return JSON.parse(new TextDecoder().decode(base64UrlToBytes(segment))) as T;
  } catch {
    return null;
  }
}

/**
 * Access publishes its signing keys at a well-known path on the team domain.
 * Cached per isolate; a `kid` miss forces one refetch so key rotation does not
 * lock the admin out until the isolate recycles.
 */
async function jwks(force: boolean): Promise<JsonWebKey[]> {
  const fresh = jwksCache && Date.now() - jwksCache.fetchedAt < JWKS_TTL_MS;
  if (!force && fresh) return jwksCache!.keys;

  const res = await fetch(`https://${teamDomain()}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error(`Access certs fetch failed: ${res.status}`);

  const body = (await res.json()) as { keys?: JsonWebKey[] };
  const keys = Array.isArray(body.keys) ? body.keys : [];
  jwksCache = { keys, fetchedAt: Date.now() };
  return keys;
}

async function verifySignature(
  kid: string,
  signingInput: string,
  signature: Uint8Array<ArrayBuffer>,
): Promise<boolean> {
  for (const force of [false, true]) {
    const keys = await jwks(force);
    const jwk = keys.find((k) => (k as { kid?: string }).kid === kid);
    if (!jwk) {
      // Unknown kid on the cached set: refetch once, then give up.
      if (!force) continue;
      return false;
    }

    const key = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    );

    return crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      key,
      signature,
      new TextEncoder().encode(signingInput),
    );
  }
  return false;
}

/** Reads the Access JWT from the header, falling back to the cookie. */
function readAssertion(request: Request): string | null {
  const header = request.headers.get(JWT_HEADER);
  if (header) return header;

  const cookies = request.headers.get('Cookie');
  if (!cookies) return null;
  for (const part of cookies.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === JWT_COOKIE) return rest.join('=');
  }
  return null;
}

/**
 * Verifies the Access assertion and returns the identity it carries, or null.
 *
 * Checks, in order: the token is a well-formed RS256 JWT, the signature matches
 * a current Access signing key, the issuer is this team, the audience contains
 * this application's tag, and the token is inside its validity window. The
 * audience check is what stops a valid token minted for a *different* Access
 * application on the same team from being replayed here.
 */
export async function getAccessIdentity(request: Request): Promise<AccessIdentity | null> {
  if (!isAccessConfigured()) return null;

  const token = readAssertion(request);
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [rawHeader, rawPayload, rawSignature] = parts;

  const header = decodeJsonSegment<{ alg?: string; kid?: string }>(rawHeader);
  // Pin the algorithm. Accepting whatever the token names would allow "none"
  // and HS256-signed-with-the-public-key forgeries.
  if (!header || header.alg !== 'RS256' || !header.kid) return null;

  const claims = decodeJsonSegment<AccessClaims>(rawPayload);
  if (!claims) return null;

  let signature: Uint8Array<ArrayBuffer>;
  try {
    signature = base64UrlToBytes(rawSignature);
  } catch {
    return null;
  }

  let ok = false;
  try {
    ok = await verifySignature(header.kid, `${rawHeader}.${rawPayload}`, signature);
  } catch {
    return null;
  }
  if (!ok) return null;

  if (claims.iss !== `https://${teamDomain()}`) return null;

  const aud = Array.isArray(claims.aud) ? claims.aud : claims.aud ? [claims.aud] : [];
  if (!aud.includes(audienceTag())) return null;

  const now = Math.floor(Date.now() / 1000);
  if (typeof claims.exp !== 'number' || claims.exp + SKEW <= now) return null;
  if (typeof claims.nbf === 'number' && claims.nbf - SKEW > now) return null;
  if (typeof claims.iat === 'number' && claims.iat - SKEW > now) return null;

  return { email: claims.email ?? '', sub: claims.sub ?? '' };
}

/**
 * True when the request carries a valid Access assertion.
 *
 * `import.meta.env.DEV` is substituted at build time and is always false in a
 * production bundle, so the local bypass cannot ship. Without it `npm run dev`
 * would be unusable: Access only exists in front of the deployed hostname.
 */
export async function isAuthenticated(request: Request): Promise<boolean> {
  if (import.meta.env.DEV) return true;
  return (await getAccessIdentity(request)) !== null;
}

/** Best-effort display name for the signed-in admin. */
export async function currentAdminEmail(request: Request): Promise<string> {
  if (import.meta.env.DEV) return 'local dev (Access bypassed)';
  return (await getAccessIdentity(request))?.email ?? '';
}

/** Returns a 401/500 Response when the request may not proceed, else null. */
export async function verifyToken(request: Request): Promise<Response | null> {
  if (import.meta.env.DEV) return null;

  if (!isAccessConfigured()) {
    return Response.json({ error: 'Admin not configured' }, { status: 500 });
  }
  if (!(await isAuthenticated(request))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
