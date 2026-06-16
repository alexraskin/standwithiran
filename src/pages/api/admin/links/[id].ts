import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { verifyToken } from '../../../../lib/auth';

export const prerender = false;

export const PUT: APIRoute = async ({ request, params }) => {
  const unauthorized = await verifyToken(request);
  if (unauthorized) return unauthorized;

  const id = params.id;
  let body: {
    title?: string;
    url?: string;
    icon?: string;
    category?: string;
    featured?: boolean;
    sort_order?: number;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (body.title !== undefined) { fields.push('title = ?'); values.push(body.title); }
  if (body.url !== undefined) { fields.push('url = ?'); values.push(body.url); }
  if (body.icon !== undefined) { fields.push('icon = ?'); values.push(body.icon); }
  if (body.category !== undefined) { fields.push('category = ?'); values.push(body.category); }
  if (body.featured !== undefined) { fields.push('featured = ?'); values.push(body.featured ? 1 : 0); }
  if (body.sort_order !== undefined) { fields.push('sort_order = ?'); values.push(body.sort_order); }

  if (fields.length === 0) {
    return Response.json({ error: 'No fields to update' }, { status: 400 });
  }

  values.push(id);
  await env.DB
    .prepare(`UPDATE links SET ${fields.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();

  return Response.json({ ok: true });
};

export const DELETE: APIRoute = async ({ request, params }) => {
  const unauthorized = await verifyToken(request);
  if (unauthorized) return unauthorized;

  await env.DB
    .prepare('DELETE FROM links WHERE id = ?')
    .bind(params.id)
    .run();

  return Response.json({ ok: true });
};
