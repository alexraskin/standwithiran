import { env } from 'cloudflare:workers';

export const SESSION_COOKIE = 'admin_session';

/** Session lifetime, in seconds. Enforced server side, not just by the cookie. */
export const SESSION_MAX_AGE = 60 * 60 * 12;

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return toHex(new Uint8Array(hashBuffer));
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** 256 bits of CSPRNG output. Never derived from the admin password. */
function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

/**
 * Length-independent comparison over equal-length strings. The early return on
 * differing lengths leaks only the length, which is not secret here.
 */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Mints a session and returns the raw token for the cookie. Only its hash is
 * persisted. Expired rows are swept on the same round trip.
 */
export async function createSession(): Promise<string> {
  const token = randomToken();
  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(now),
    env.DB
      .prepare('INSERT INTO sessions (token_hash, created_at, expires_at) VALUES (?, ?, ?)')
      .bind(await sha256Hex(token), now, now + SESSION_MAX_AGE * 1000),
  ]);
  return token;
}

/** Revokes a session server side so a captured cookie stops working. */
export async function destroySession(token: string | null): Promise<void> {
  if (!token) return;
  await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?')
    .bind(await sha256Hex(token))
    .run();
}

/** Reads the admin_session cookie value off a raw request. */
export function readSessionCookie(request: Request): string | null {
  const header = request.headers.get('Cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === SESSION_COOKIE) return rest.join('=');
  }
  return null;
}

/** True when the request carries a session that exists and has not expired. */
export async function isAuthenticated(request: Request): Promise<boolean> {
  const token = readSessionCookie(request);
  if (!token) return false;

  const row = await env.DB
    .prepare('SELECT expires_at FROM sessions WHERE token_hash = ?')
    .bind(await sha256Hex(token))
    .first<{ expires_at: number }>();

  return row !== null && row.expires_at > Date.now();
}

/** Returns a 401 Response when unauthenticated, or null when the request is allowed. */
export async function verifyToken(request: Request): Promise<Response | null> {
  if (!env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Admin not configured' }, { status: 500 });
  }
  if (!(await isAuthenticated(request))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
