import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { sha256Hex } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json<{ password: string }>();
  const password = env.ADMIN_PASSWORD;

  if (!password) {
    return Response.json({ error: 'Admin not configured' }, { status: 500 });
  }

  if (body.password !== password) {
    return Response.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = await sha256Hex(password);
  return Response.json({ token });
};
