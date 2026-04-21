import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { verifyToken } from '../../../lib/auth';

export const prerender = false;

const ALLOWED_KEYS = [
  'banner_enabled',
  'banner_type',
  'banner_text',
  'banner_link',
  'profile_description',
  'profile_description_fa',
  'contact_email',
  'last_updated',
];

export const GET: APIRoute = async ({ request }) => {
  const unauthorized = await verifyToken(request);
  if (unauthorized) return unauthorized;

  const result = await env.DB
    .prepare('SELECT key, value FROM config')
    .all();

  const config: Record<string, string> = {};
  for (const row of result.results as { key: string; value: string }[]) {
    config[row.key] = row.value;
  }
  return Response.json({ config });
};

export const PUT: APIRoute = async ({ request }) => {
  const unauthorized = await verifyToken(request);
  if (unauthorized) return unauthorized;

  const body = await request.json<Record<string, string>>();
  const statements = [];

  for (const [key, value] of Object.entries(body)) {
    if (!ALLOWED_KEYS.includes(key)) continue;
    statements.push(
      env.DB.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').bind(key, value),
    );
  }

  if (statements.length > 0) {
    await env.DB.batch(statements);
  }

  return Response.json({ ok: true });
};
