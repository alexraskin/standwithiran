import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { verifyToken } from '../../../../lib/auth';
import { isCategory, isHttpUrl, isIcon } from '../../../../lib/content-schema';

const MAX_TITLE_LENGTH = 200;
const MAX_URL_LENGTH = 2048;

/** `params.id` is an arbitrary path segment. Bound unparsed it matched no rows
 *  and the route still answered 200, so the CMS reported phantom successes. */
function parseId(raw: string | undefined): number | null {
  if (!raw || !/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export const PUT: APIRoute = async ({ request, params }) => {
  const unauthorized = await verifyToken(request);
  if (unauthorized) return unauthorized;

  const id = parseId(params.id);
  if (id === null) {
    return Response.json({ error: 'Invalid link id' }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (body.title !== undefined) {
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title || title.length > MAX_TITLE_LENGTH) {
      return Response.json(
        { error: `title must be 1 to ${MAX_TITLE_LENGTH} characters` },
        { status: 400 },
      );
    }
    fields.push('title = ?');
    values.push(title);
  }

  if (body.url !== undefined) {
    const url = typeof body.url === 'string' ? body.url.trim() : '';
    if (url.length > MAX_URL_LENGTH || !isHttpUrl(url)) {
      return Response.json({ error: 'url must be an http or https URL' }, { status: 400 });
    }
    fields.push('url = ?');
    values.push(url);
  }

  if (body.icon !== undefined) {
    if (typeof body.icon !== 'string' || !isIcon(body.icon)) {
      return Response.json({ error: `unknown icon: ${String(body.icon)}` }, { status: 400 });
    }
    fields.push('icon = ?');
    values.push(body.icon);
  }

  if (body.category !== undefined) {
    if (typeof body.category !== 'string' || !isCategory(body.category)) {
      return Response.json({ error: `unknown category: ${String(body.category)}` }, { status: 400 });
    }
    fields.push('category = ?');
    values.push(body.category);
  }

  if (body.featured !== undefined) {
    fields.push('featured = ?');
    values.push(body.featured ? 1 : 0);
  }

  if (body.sort_order !== undefined) {
    if (!Number.isSafeInteger(body.sort_order)) {
      return Response.json({ error: 'sort_order must be an integer' }, { status: 400 });
    }
    fields.push('sort_order = ?');
    values.push(body.sort_order as number);
  }

  if (fields.length === 0) {
    return Response.json({ error: 'No fields to update' }, { status: 400 });
  }

  values.push(id);
  const result = await env.DB
    .prepare(`UPDATE links SET ${fields.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();

  if (result.meta.changes === 0) {
    return Response.json({ error: 'Link not found' }, { status: 404 });
  }

  return Response.json({ ok: true });
};

export const DELETE: APIRoute = async ({ request, params }) => {
  const unauthorized = await verifyToken(request);
  if (unauthorized) return unauthorized;

  const id = parseId(params.id);
  if (id === null) {
    return Response.json({ error: 'Invalid link id' }, { status: 400 });
  }

  const result = await env.DB.prepare('DELETE FROM links WHERE id = ?').bind(id).run();

  if (result.meta.changes === 0) {
    return Response.json({ error: 'Link not found' }, { status: 404 });
  }

  return Response.json({ ok: true });
};
