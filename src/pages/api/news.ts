import type { APIRoute } from 'astro';
import { getNewsItems } from '../../lib/news';

export const prerender = false;

const CACHE_MAX_AGE = 600;

export const GET: APIRoute = async () => {
  const items = await getNewsItems();
  if (items === null) {
    return Response.json({ error: 'Failed to fetch RSS feed' }, { status: 502 });
  }
  return Response.json(
    { items },
    {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=3600`,
      },
    },
  );
};
