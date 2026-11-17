import type { APIRoute } from 'astro';
import { getSiteData } from '../lib/site-data';
import { LEGAL_PAGES, PAGES, type Lang, type Page } from '../lib/i18n';
import { canonicalFor, isoDate, OG_IMAGE } from '../lib/seo';

export const GET: APIRoute = async () => {
  const { lastUpdated } = await getSiteData();
  const lastmod = isoDate(lastUpdated) ?? new Date().toISOString().slice(0, 10);

  const url = (lang: Lang, page: Page) => `  <url>
    <loc>${canonicalFor(lang, page)}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${canonicalFor('en', page)}" />
    <xhtml:link rel="alternate" hreflang="fa" href="${canonicalFor('fa', page)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${canonicalFor('en', page)}" />
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page ? 'weekly' : 'daily'}</changefreq>
    <priority>${page ? '0.7' : lang === 'en' ? '1.0' : '0.9'}</priority>${
      page
        ? ''
        : `
    <image:image>
      <image:loc>${OG_IMAGE.url}</image:loc>
      <image:title>${OG_IMAGE.alt}</image:title>
    </image:image>`
    }
  </url>`;

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${[...PAGES, ...LEGAL_PAGES].flatMap((page) => [url('en', page), url('fa', page)]).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
