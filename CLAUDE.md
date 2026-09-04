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

There is no test suite and no linter configured. Node >= 22.12 is required.

Local dev requires `.dev.vars` with `ADMIN_PASSWORD=<something>` so `/admin` login works. Production uses a Worker secret: `npx wrangler secret put ADMIN_PASSWORD`.

## Architecture

Astro 6 SSR app deployed as a single Cloudflare Worker via `@astrojs/cloudflare`. Nothing is prerendered — every page and API route sets `export const prerender = false` and reads from D1 at request time. Static files in `public/` are served through the `ASSETS` binding.

**Runtime bindings** (see `wrangler.jsonc`, typed in `worker-configuration.d.ts`):
- `env.DB` — D1 database `standwithiran-db`
- `env.ASSETS` — static asset fetcher
- `env.ADMIN_PASSWORD` — secret; read by `src/lib/auth.ts`

Access bindings via `import { env } from 'cloudflare:workers'` (not via `Astro.locals`). This pattern is consistent across pages and API routes.

### Data model (D1)

Two tables, seeded by `migrations/001_init.sql`:
- `links` — ordered resource list (`sort_order ASC`), with `featured` flag and `category`/`icon` strings.
- `config` — generic key/value store. All site-wide editable content (banner, profile description EN + FA, contact email, last-updated date) lives here.

The set of config keys the admin API will write is whitelisted in `src/pages/api/admin/config.ts` (`ALLOWED_KEYS`). **Adding a new editable site field means updating both that whitelist and `getSiteData` in `src/lib/site-data.ts`**, which is the single shared reader used by SSR pages and `/api/site`.

### i18n

Astro `i18n` config declares `en` (default, no prefix) and `fa` (`/fa/`). Translations are a flat object keyed by locale in `src/lib/i18n.ts` — UI strings live in code, content strings (banner, profile) live in D1. The Farsi page sets `dir="rtl"` and pulls `profile.description_fa` from config.

### Admin CMS

`/admin` (`src/pages/admin.astro`) is a single-page vanilla-JS CMS. Auth is intentionally minimal:
1. `POST /api/admin/login` with `{ password }` — server compares plaintext against `env.ADMIN_PASSWORD` and returns `sha256(password)` as a bearer token.
2. All admin endpoints call `verifyToken(request)` which recomputes `sha256(ADMIN_PASSWORD)` and compares. There are no sessions, expirations, or per-user state.

Admin endpoints:
- `GET/POST /api/admin/links`, `PUT/DELETE /api/admin/links/[id]` — CRUD on `links`
- `GET/PUT /api/admin/config` — read all config; write only whitelisted keys

### News

`src/lib/news.ts` fetches `https://azadiwire.org/feed.xml` at request time and parses it with regex (no XML library). Returns up to 5 items. Served via `/api/news`. Failures return `null` — the component shows a fallback, the request does not 500.

### SEO

`src/lib/seo.ts` is the single source for canonical URLs, per-locale title/description/OG copy, the `<h1>` text, and the OG image constants. **Changing site-wide meta copy means editing `seo.ts`, not `BaseLayout.astro`.** `BaseLayout` builds a schema.org `@graph` (WebSite + Organization + WebPage) and accepts an optional `jsonLd` prop for extra nodes; the index pages pass an `ItemList` of the D1 links via `resourcesItemList`.

`public/images/og-image.jpg` is a 1200x630 social card generated from the hero photo. Regenerate it if the hero art or wordmark changes, and keep the dimensions in `OG_IMAGE` in sync.

`src/middleware.ts` 301-redirects `www.standwithiran.org` to the apex host (both are bound as custom domains in `wrangler.jsonc`) and sets `X-Robots-Tag: noindex` on `/api/*` and `/admin`. `public/_headers` only applies to static assets served by the `ASSETS` binding, so it does **not** cover those SSR routes.

### Sitemap & error pages

`src/pages/sitemap.xml.ts` is a hand-rolled SSR endpoint emitting `hreflang` alternates and an image entry for `/` and `/fa/`, with `<lastmod>` read from the `last_updated` config row. `404.astro` returns a real 404 and `500.astro` a real error page; neither redirects to `/`, which previously produced soft 404s.

## Conventions

- Every page/API route touching bindings must export `prerender = false`. The Cloudflare adapter will otherwise try to prerender and fail on `env.DB`.
- When changing D1 bindings or adding secrets, run `npm run cf-typegen` to refresh `worker-configuration.d.ts`.
- Migrations are append-only numbered SQL files in `migrations/`. `wrangler d1 migrations apply` tracks which have run.
