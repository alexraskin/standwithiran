import type { APIRoute } from 'astro';
import { destroySession, readSessionCookie, SESSION_COOKIE } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  // Revoke server side as well as clearing the cookie, so a copy of the cookie
  // captured before logout stops working.
  await destroySession(readSessionCookie(request));
  cookies.delete(SESSION_COOKIE, { path: '/' });
  return Response.json({ ok: true });
};
