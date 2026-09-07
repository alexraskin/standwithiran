import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { verifyToken } from '../../../lib/auth';
import { isBannerType, isHttpUrl, isIsoDateOrEmpty } from '../../../lib/content-schema';

/** Guards against a runaway write filling a config row. Long enough for the
 *  multi-paragraph profile descriptions. */
const MAX_VALUE_LENGTH = 20_000;

/**
 * Every writable config key, with the rule its value must satisfy.
 *
 * Adding a site field means adding it here and to `getSiteData` in
 * src/lib/site-data.ts.
 */
const VALIDATORS: Record<string, (value: string) => boolean> = {
  banner_enabled: (v) => v === '0' || v === '1',
  banner_type: isBannerType,
  banner_text: () => true,
  banner_link: (v) => v === '' || isHttpUrl(v),
  profile_description: () => true,
  profile_description_fa: () => true,
  contact_email: (v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  last_updated: isIsoDateOrEmpty,
  stat_amini_date: isIsoDateOrEmpty,
  stat_protest_date: isIsoDateOrEmpty,
  stat_blackout_date: isIsoDateOrEmpty,
  stat_war_date: isIsoDateOrEmpty,
};

export const GET: APIRoute = async ({ request }) => {
  const unauthorized = await verifyToken(request);
  if (unauthorized) return unauthorized;

  const result = await env.DB
    .prepare('SELECT key, value FROM config')
    .all<{ key: string; value: string }>();

  const config: Record<string, string> = {};
  for (const row of result.results) {
    config[row.key] = row.value;
  }
  return Response.json({ config });
};

export const PUT: APIRoute = async ({ request }) => {
  const unauthorized = await verifyToken(request);
  if (unauthorized) return unauthorized;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return Response.json({ error: 'Body must be a JSON object' }, { status: 400 });
  }

  // Reject rather than skip. Silently dropping a key and still answering
  // `{ ok: true }` made the CMS report a save that never happened.
  const rejected: string[] = [];
  const statements = [];

  for (const [key, value] of Object.entries(body)) {
    const validate = VALIDATORS[key];
    if (!validate) {
      rejected.push(`${key}: not a writable config key`);
      continue;
    }
    if (typeof value !== 'string') {
      rejected.push(`${key}: value must be a string`);
      continue;
    }
    if (value.length > MAX_VALUE_LENGTH) {
      rejected.push(`${key}: exceeds ${MAX_VALUE_LENGTH} characters`);
      continue;
    }
    if (!validate(value)) {
      rejected.push(`${key}: invalid value`);
      continue;
    }
    statements.push(
      env.DB.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').bind(key, value),
    );
  }

  if (rejected.length > 0) {
    return Response.json({ error: rejected.join('; ') }, { status: 400 });
  }

  if (statements.length === 0) {
    return Response.json({ error: 'No config keys to write' }, { status: 400 });
  }

  await env.DB.batch(statements);

  return Response.json({ ok: true, updated: statements.length });
};
