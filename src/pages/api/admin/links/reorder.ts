import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { verifyToken } from '../../../../lib/auth';

/**
 * Rewrites `sort_order` for the whole list in one D1 batch.
 *
 * The CMS previously reordered by firing two independent PUTs through
 * Promise.all, which left the ordering corrupted with no rollback if one of
 * them failed.
 *
 * A static route file wins over `[id].ts`, so this does not collide with
 * PUT/DELETE on a link id.
 */
export const POST: APIRoute = async ({ request }) => {
  const unauthorized = await verifyToken(request);
  if (unauthorized) return unauthorized;

  let body: { ids?: unknown };
  try {
    body = await request.json<{ ids?: unknown }>();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const ids = body.ids;
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => Number.isSafeInteger(id))) {
    return Response.json({ error: 'ids must be a non-empty array of integers' }, { status: 400 });
  }

  if (new Set(ids).size !== ids.length) {
    return Response.json({ error: 'ids must be unique' }, { status: 400 });
  }

  const existing = await env.DB.prepare('SELECT COUNT(*) AS count FROM links').first<{
    count: number;
  }>();

  if ((existing?.count ?? 0) !== ids.length) {
    return Response.json({ error: 'ids must cover every link' }, { status: 409 });
  }

  const statements = ids.map((id, index) =>
    env.DB.prepare('UPDATE links SET sort_order = ? WHERE id = ?').bind(index + 1, id),
  );

  const results = await env.DB.batch(statements);

  if (results.some((result) => result.meta.changes === 0)) {
    return Response.json({ error: 'One or more ids do not exist' }, { status: 404 });
  }

  return Response.json({ ok: true });
};
