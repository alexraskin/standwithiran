import { env } from 'cloudflare:workers';

export const SESSION_COOKIE = 'admin_session';

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** The session token an authenticated request must present (sha256 of the password). */
export async function expectedToken(): Promise<string | null> {
  const password = env.ADMIN_PASSWORD;
  if (!password) return null;
  return sha256Hex(password);
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

/** True when the request carries a valid admin session cookie. */
export async function isAuthenticated(request: Request): Promise<boolean> {
  const expected = await expectedToken();
  if (!expected) return false;
  const token = readSessionCookie(request);
  return token !== null && token === expected;
}

/** Returns a 401 Response when unauthenticated, or null when the request is allowed. */
export async function verifyToken(request: Request): Promise<Response | null> {
  if (env.ADMIN_PASSWORD === undefined) {
    return Response.json({ error: 'Admin not configured' }, { status: 500 });
  }
  if (!(await isAuthenticated(request))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
