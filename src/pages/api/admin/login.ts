import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import {
  constantTimeEqual,
  createSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from '../../../lib/auth';

// Brute-force throttle backed by the Workers rate limiting binding, so the
// counter is shared across isolates rather than being per-isolate best effort.
// The binding is still local to the Cloudflare location handling the request
// and is eventually consistent, but it is a far higher bar than an in-memory
// Map. `period` accepts only 10 or 60 seconds, hence the one minute window.
const RATE_LIMIT_PERIOD = 60;

export const POST: APIRoute = async ({ request, cookies }) => {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const { success } = await env.LOGIN_RATE_LIMITER.limit({ key: `login:${ip}` });

  if (!success) {
    return Response.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(RATE_LIMIT_PERIOD) } },
    );
  }

  let body: { password?: unknown };
  try {
    body = await request.json<{ password?: unknown }>();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const password = env.ADMIN_PASSWORD;
  if (!password) {
    return Response.json({ error: 'Admin not configured' }, { status: 500 });
  }

  const submitted = typeof body.password === 'string' ? body.password : '';
  if (!constantTimeEqual(submitted, password)) {
    // small delay to slow automated guessing
    await new Promise((r) => setTimeout(r, 500));
    return Response.json({ error: 'Invalid password' }, { status: 401 });
  }

  cookies.set(SESSION_COOKIE, await createSession(), {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  return Response.json({ ok: true });
};
