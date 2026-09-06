import type { MiddlewareHandler } from 'astro';

const CANONICAL_HOST = 'standwithiran.org';
const WWW_HOST = `www.${CANONICAL_HOST}`;

/** Routes that must never be indexed. `public/_headers` only applies to static
 *  assets, so SSR routes have to set the header themselves. */
const NOINDEX_PREFIXES = ['/api/', '/admin'];

/** Applied to every SSR response. `public/_headers` covers only what the ASSETS
 *  binding serves, so without this every page and API route shipped bare. */
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Legacy backstop for the CSP's frame-ancestors directive.
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

/**
 * Content is edited through the CMS, so the window is short. Shared caches keep
 * serving the previous render while the next one is fetched, taking D1 off the
 * critical path for repeat visitors.
 *
 * This lives here rather than in the page: `Astro.response.headers` only
 * applies before the response starts streaming, so a write from inside a child
 * component is silently dropped.
 */
const CACHED_PATHS = new Set(['/', '/fa', '/fa/']);
const PAGE_CACHE_CONTROL = 'public, max-age=0, s-maxage=60, stale-while-revalidate=600';

/** The Host header is authoritative; `request.url` is rebuilt by the adapter and
 *  does not always carry the hostname the client asked for. */
function requestHost(request: Request, url: URL): string {
  const header = request.headers.get('host');
  return (header ?? url.host).split(':')[0].toLowerCase();
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const url = new URL(context.request.url);

  // Collapse www onto the apex host. Both are bound as custom domains in
  // wrangler.jsonc, so without this every page is reachable at two hostnames and
  // ranking signals are split between them.
  if (requestHost(context.request, url) === WWW_HOST) {
    url.protocol = 'https:';
    url.host = CANONICAL_HOST;
    return context.redirect(url.toString(), 301);
  }

  const response = await next();

  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(name, value);
  }

  if (response.status === 200 && CACHED_PATHS.has(url.pathname)) {
    response.headers.set('Cache-Control', PAGE_CACHE_CONTROL);
  }

  if (NOINDEX_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
};
