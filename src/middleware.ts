import type { MiddlewareHandler } from 'astro';

const CANONICAL_HOST = 'standwithiran.org';
const WWW_HOST = `www.${CANONICAL_HOST}`;

/** Routes that must never be indexed. `public/_headers` only applies to static
 *  assets, so SSR routes have to set the header themselves. */
const NOINDEX_PREFIXES = ['/api/', '/admin'];

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

  if (NOINDEX_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
};
