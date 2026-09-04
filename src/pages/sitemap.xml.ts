import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { canonicalFor, isoDate, OG_IMAGE } from '../lib/seo';

export const prerender = false;

const ALTERNATES = `
    <xhtml:link rel="alternate" hreflang="en" href="${canonicalFor('en')}" />
    <xhtml:link rel="alternate" hreflang="fa" href="${canonicalFor('fa')}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${canonicalFor('en')}" />`;

async function lastModified(): Promise<string> {
  try {
    const row = await env.DB.prepare("SELECT value FROM config WHERE key = 'last_updated'").first<{
      value: string;
    }>();
    return isoDate(row?.value ?? '') ?? new Date().toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export const GET: APIRoute = async () => {
  const lastmod = await lastModified();

  const url = (loc: string, priority: string) => `  <url>
    <loc>${loc}</loc>${ALTERNATES}
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${OG_IMAGE.url}</image:loc>
      <image:title>${OG_IMAGE.alt}</image:title>
    </image:image>
  </url>`;

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${url(canonicalFor('en'), '1.0')}
${url(canonicalFor('fa'), '0.9')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'X-Robots-Tag': 'noindex',
    },
  });
};
