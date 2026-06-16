import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { expectedToken, SESSION_COOKIE } from '../../../lib/auth';

export const prerender = false;

const SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

// Best-effort, per-isolate brute-force throttle. Not a hard guarantee (Workers
// isolates are ephemeral and an attacker may hit several), but it meaningfully
// slows credential stuffing from a single source without extra infrastructure.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;
const attempts = new Map<string, { count: number; first: number }>();

function rateState(ip: string) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.first > WINDOW_MS) {
    return { count: 0, first: now };
  }
  return entry;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const state = rateState(ip);

  if (state.count >= MAX_FAILURES) {
    const retryAfter = Math.ceil((state.first + WINDOW_MS - Date.now()) / 1000);
    return Response.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.max(retryAfter, 1)) } },
    );
  }

  let body: { password: string };
  try {
    body = await request.json<{ password: string }>();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const password = env.ADMIN_PASSWORD;
  if (!password) {
    return Response.json({ error: 'Admin not configured' }, { status: 500 });
  }

  if (body.password !== password) {
    attempts.set(ip, { count: state.count + 1, first: state.first });
    // small delay to slow automated guessing
    await new Promise((r) => setTimeout(r, 500));
    return Response.json({ error: 'Invalid password' }, { status: 401 });
  }

  attempts.delete(ip);

  const token = await expectedToken();
  cookies.set(SESSION_COOKIE, token!, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  return Response.json({ ok: true });
};
