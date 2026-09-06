import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import {
  constantTimeEqual,
  createSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from '../../../lib/auth';

// Best-effort, per-isolate brute-force throttle. Not a hard guarantee (Workers
// isolates are ephemeral and an attacker may hit several), but it meaningfully
// slows credential stuffing from a single source without extra infrastructure.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;
const attempts = new Map<string, { count: number; first: number }>();

/**
 * Drops entries whose window has closed. Without this the map only ever shrank
 * on a successful login, so it grew for the life of the isolate.
 */
function sweep(now: number): void {
  for (const [ip, entry] of attempts) {
    if (now - entry.first > WINDOW_MS) attempts.delete(ip);
  }
}

function rateState(ip: string, now: number) {
  const entry = attempts.get(ip);
  if (!entry || now - entry.first > WINDOW_MS) {
    return { count: 0, first: now };
  }
  return entry;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const now = Date.now();
  sweep(now);

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const state = rateState(ip, now);

  if (state.count >= MAX_FAILURES) {
    const retryAfter = Math.ceil((state.first + WINDOW_MS - now) / 1000);
    return Response.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.max(retryAfter, 1)) } },
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
    attempts.set(ip, { count: state.count + 1, first: state.first });
    // small delay to slow automated guessing
    await new Promise((r) => setTimeout(r, 500));
    return Response.json({ error: 'Invalid password' }, { status: 401 });
  }

  attempts.delete(ip);

  cookies.set(SESSION_COOKIE, await createSession(), {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  return Response.json({ ok: true });
};
