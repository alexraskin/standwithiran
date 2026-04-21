import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getSiteData } from '../../lib/site-data';

export const prerender = false;

export const GET: APIRoute = async () => {
  const data = await getSiteData(env.DB);
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
    },
  });
};
