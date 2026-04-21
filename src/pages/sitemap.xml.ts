import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://standwithiran.org/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://standwithiran.org/" />
    <xhtml:link rel="alternate" hreflang="fa" href="https://standwithiran.org/fa/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://standwithiran.org/" />
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://standwithiran.org/fa/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://standwithiran.org/" />
    <xhtml:link rel="alternate" hreflang="fa" href="https://standwithiran.org/fa/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://standwithiran.org/" />
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
