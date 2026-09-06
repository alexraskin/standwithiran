import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { verifyToken } from '../../../../lib/auth';
import {
  DEFAULT_CATEGORY,
  DEFAULT_ICON,
  isCategory,
  isHttpUrl,
  isIcon,
} from '../../../../lib/content-schema';
import type { LinkRow } from '../../../../lib/types';

const MAX_TITLE_LENGTH = 200;
const MAX_URL_LENGTH = 2048;

export const GET: APIRoute = async ({ request }) => {
  const unauthorized = await verifyToken(request);
  if (unauthorized) return unauthorized;

  const result = await env.DB
    .prepare(
      'SELECT id, title, url, icon, category, featured, sort_order FROM links ORDER BY sort_order ASC',
    )
    .all<LinkRow>();
  return Response.json({ links: result.results });
};

export const POST: APIRoute = async ({ request }) => {
  const unauthorized = await verifyToken(request);
  if (unauthorized) return unauthorized;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const url = typeof body.url === 'string' ? body.url.trim() : '';

  if (!title || title.length > MAX_TITLE_LENGTH) {
    return Response.json(
      { error: `title is required and must be at most ${MAX_TITLE_LENGTH} characters` },
      { status: 400 },
    );
  }
  if (url.length > MAX_URL_LENGTH || !isHttpUrl(url)) {
    return Response.json({ error: 'url must be an http or https URL' }, { status: 400 });
  }

  const icon = typeof body.icon === 'string' ? body.icon : DEFAULT_ICON;
  if (!isIcon(icon)) {
    return Response.json({ error: `unknown icon: ${icon}` }, { status: 400 });
  }

  const category = typeof body.category === 'string' ? body.category : DEFAULT_CATEGORY;
  if (!isCategory(category)) {
    return Response.json({ error: `unknown category: ${category}` }, { status: 400 });
  }

  const maxResult = await env.DB
    .prepare('SELECT COALESCE(MAX(sort_order), 0) AS max_order FROM links')
    .first<{ max_order: number }>();

  const result = await env.DB
    .prepare(
      'INSERT INTO links (title, url, icon, category, featured, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind(title, url, icon, category, body.featured ? 1 : 0, (maxResult?.max_order ?? 0) + 1)
    .run();

  return Response.json({ id: result.meta.last_row_id }, { status: 201 });
};
