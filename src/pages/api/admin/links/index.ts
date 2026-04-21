import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { verifyToken } from '../../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const unauthorized = await verifyToken(request);
  if (unauthorized) return unauthorized;

  const result = await env.DB
    .prepare('SELECT * FROM links ORDER BY sort_order ASC')
    .all();
  return Response.json({ links: result.results });
};

export const POST: APIRoute = async ({ request }) => {
  const unauthorized = await verifyToken(request);
  if (unauthorized) return unauthorized;

  const body = await request.json<{
    title: string;
    url: string;
    icon?: string;
    category?: string;
    featured?: boolean;
  }>();

  if (!body.title || !body.url) {
    return Response.json({ error: 'title and url are required' }, { status: 400 });
  }

  const maxResult = await env.DB
    .prepare('SELECT COALESCE(MAX(sort_order), 0) as max_order FROM links')
    .first<{ max_order: number }>();

  const nextOrder = (maxResult?.max_order || 0) + 1;

  const result = await env.DB
    .prepare(
      'INSERT INTO links (title, url, icon, category, featured, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind(
      body.title,
      body.url,
      body.icon || 'globe',
      body.category || 'information',
      body.featured ? 1 : 0,
      nextOrder,
    )
    .run();

  return Response.json({ id: result.meta.last_row_id }, { status: 201 });
};
