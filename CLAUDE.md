# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

| Command | Action |
| :------ | :----- |
| `npm run dev` | Astro dev server at `localhost:4321` (uses local D1 via Miniflare) |
| `npm run build` | Build SSR bundle to `./dist/` |
| `npm run preview` | Build + run `astro preview` |
| `npm run deploy` | `astro build && wrangler deploy` |
| `npm run db:migrate` | Apply `migrations/*.sql` to the remote D1 (`standwithiran-db`) |
| `npm run db:migrate:local` | Apply migrations to the local D1 replica under `.wrangler/` |
| `npm run cf-typegen` | Regenerate `worker-configuration.d.ts` from `wrangler.jsonc` bindings |

`npm run check` runs `astro check` (typecheck). It also runs in CI before the
build. There is no unit test suite and no linter configured. Node >= 22.12 is
required.

Local dev requires `.dev.vars` with `ADMIN_PASSWORD=<something>` so `/admin` login works. Production uses a Worker secret: `npx wrangler secret put ADMIN_PASSWORD`.

## Architecture

Astro 6 SSR app deployed as a single Cloudflare Worker via `@astrojs/cloudflare`. `output: 'server'` in `astro.config.mjs` makes SSR the default, so no route needs `export const prerender = false`; everything reads from D1 at request time. Static files in `public/` are served through the `ASSETS` binding.

**Runtime bindings** (see `wrangler.jsonc`, typed in `worker-configuration.d.ts`):
- `env.DB` — D1 database `standwithiran-db`
- `env.ASSETS` — static asset fetcher
- `env.ADMIN_PASSWORD` — secret; read by `src/lib/auth.ts`

Access bindings via `import { env } from 'cloudflare:workers'` (not via `Astro.locals`). This pattern is consistent across pages and API routes.

`ADMIN_PASSWORD` is a secret, so it is absent from `wrangler.jsonc` and `wrangler types` cannot discover it. It is declared by hand on `Cloudflare.Env` in `src/env.d.ts`, which survives regeneration of `worker-configuration.d.ts`.

**Type environment caveat:** `worker-configuration.d.ts` declares a global `interface Element` for HTMLRewriter that merges with the DOM `Element` and leaves `remove()` ambiguous. Any generic constrained by `Element` (`querySelector<T>`, `querySelectorAll<T>`) therefore fails to compile in client-side scripts. The CMS script in `admin.astro` casts instead; do the same in new client code.

### Data model (D1)

Three tables:
- `links` — ordered resource list (`sort_order ASC`), with `featured` flag and `category`/`icon` strings.
- `config` — generic key/value store. All site-wide editable content (banner, profile description EN + FA, contact email, last-updated date, the three stat-counter dates) lives here.
- `sessions` — admin sessions (`migrations/003`), holding `sha256(token)` and an expiry.

Every writable config key is declared with a validator in `src/pages/api/admin/config.ts` (`VALIDATORS`); a key that is not listed is rejected with a 400 rather than silently skipped. **Adding a new editable site field means updating both that map and `getSiteData` in `src/lib/site-data.ts`**, which is the single shared reader used by SSR pages and `/api/site`.

`src/lib/content-schema.ts` is the single source for the icon and category vocabularies, the icon-to-emoji map, and the URL/date validators. The admin form options, the public rendering, and the API validation all read from it.

### i18n

Astro `i18n` config declares `en` (default, no prefix) and `fa` (`/fa/`). Translations are a flat object keyed by locale in `src/lib/i18n.ts` — UI strings live in code, content strings (banner, profile) live in D1. The Farsi page sets `dir="rtl"` and pulls `profile.description_fa` from config.

### Admin CMS

`/admin` (`src/pages/admin.astro`) is a single-page CMS. Its script is a normal processed Astro `<script>` (typed and bundled), not `is:inline`. The page is gated server side: an unauthenticated request receives only the login form, never the CMS markup.

1. `POST /api/admin/login` with `{ password }` — compares against `env.ADMIN_PASSWORD` in constant time, mints a 256-bit random token, stores `sha256(token)` in `sessions` with a 12 hour expiry, and sets it as an `httpOnly`, `SameSite=Strict` cookie. Failed attempts are throttled per isolate (8 per 15 minutes per IP).
2. Admin endpoints call `verifyToken(request)`, which looks the hashed cookie up in `sessions` and checks the expiry.
3. `POST /api/admin/logout` deletes the row, so a captured cookie stops working.

The cookie carries no password material, so a leak does not expose a crackable hash of `ADMIN_PASSWORD`.

Admin endpoints:
- `GET/POST /api/admin/links`, `PUT/DELETE /api/admin/links/[id]` — CRUD on `links`. Ids are validated and a write matching no row returns 404. URLs must be `http`/`https`.
- `POST /api/admin/links/reorder` with `{ ids }` — rewrites `sort_order` for the whole list in one `DB.batch`. A static route file wins over `[id].ts`, so it does not collide.
- `GET/PUT /api/admin/config` — read all config; write only keys with a validator

### News

`src/lib/news.ts` fetches `https://azadiwire.org/feed.xml` at request time and parses it with regex (no XML library). Entities are decoded by `src/lib/entities.ts`, a small decoder that replaced the `he` package (95KB of server bundle for forty lines of parsing). Every extracted field, the link included, is decoded and then stripped, in that order. Returns up to 5 items. Served via `/api/news`. Failures return `null` — the component shows a fallback, the request does not 500.

### SEO

`src/lib/seo.ts` is the single source for canonical URLs, per-locale title/description/OG copy, the `<h1>` text, and the OG image constants. **Changing site-wide meta copy means editing `seo.ts`, not `BaseLayout.astro`.** `BaseLayout` builds a schema.org `@graph` (WebSite + Organization + WebPage) and accepts an optional `jsonLd` prop for extra nodes; the index pages pass an `ItemList` of the D1 links via `resourcesItemList`.

`public/images/og-image.jpg` is a 1200x630 social card generated from the hero photo. Regenerate it if the hero art or wordmark changes, and keep the dimensions in `OG_IMAGE` in sync.

The favicon set (`public/favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`) is generated from one source, `scripts/generate-icons.mjs`. Edit the mark there, then run `npm i --no-save sharp png-to-ico && node scripts/generate-icons.mjs` — do not hand-edit the committed SVG or PNGs. `public/site.webmanifest` and the `Organization.logo` node in `BaseLayout.astro` point at `icon-512.png`.

`src/middleware.ts` 301-redirects `www.standwithiran.org` to the apex host (both are bound as custom domains in `wrangler.jsonc`), sets `X-Robots-Tag: noindex` on `/api/*` and `/admin`, and applies the security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`) to every SSR response. `public/_headers` only applies to static assets served by the `ASSETS` binding, so it does **not** cover those SSR routes.

The CSP comes from `security.csp` in `astro.config.mjs`. Astro hashes the inline scripts and styles it generates and emits the policy as a response header in SSR, so `frame-ancestors` is honoured there. `Astro.csp.insertScriptHash` does **not** reach that header, so do not rely on it; the JSON-LD block needs no hash because `type="application/ld+json"` is a data block that `script-src` does not govern.

### Sitemap & error pages

`src/pages/sitemap.xml.ts` is a hand-rolled SSR endpoint emitting `hreflang` alternates and an image entry for `/` and `/fa/`, with `<lastmod>` read from the `last_updated` config row. `404.astro` returns a real 404 and `500.astro` a real error page; neither redirects to `/`, which previously produced soft 404s.

## Conventions

- `output: 'server'` makes every route SSR by default, so `prerender = false` is no longer needed anywhere. Do not reintroduce it.
- `output: 'server'` also turns on Astro's `security.checkOrigin`, which rejects cross-origin POST/PUT/DELETE carrying form content types. Admin requests send `Content-Type: application/json` and pass.
- Both locales render through `src/components/HomePage.astro`. `index.astro` and `fa/index.astro` only pick the language.
- When changing D1 bindings or adding secrets, run `npm run cf-typegen` to refresh `worker-configuration.d.ts`.
- Migrations are append-only numbered SQL files in `migrations/`. `wrangler d1 migrations apply` tracks which have run.
