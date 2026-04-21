# Stand With Iran ✊

Website supporting the people of Iran in their fight for freedom and human rights. Curates resources, organizations, fundraisers, and news.

**Woman, Life, Freedom — زن، زندگی، آزادی**

Built with [Astro](https://astro.build) on [Cloudflare Workers](https://developers.cloudflare.com/workers/), backed by [D1](https://developers.cloudflare.com/d1/).

## Stack

- **Astro 6** (SSR) with `@astrojs/cloudflare` adapter
- **Cloudflare Workers** runtime, **D1** database, `ASSETS` static binding
- **i18n** — English at `/`, Farsi (RTL) at `/fa/`, both server-rendered
- **News** — AzadiWire RSS fetched and parsed at the edge
- **Admin CMS** at `/admin` — vanilla JS, SHA-256 bearer token auth

## Project Structure

```
src/
├── pages/
│   ├── index.astro          # English home (SSR)
│   ├── fa/index.astro       # Farsi home (SSR, RTL)
│   ├── admin.astro          # CMS (login + links/config editor)
│   ├── sitemap.xml.ts       # SSR sitemap with hreflang
│   ├── 404.astro, 500.astro # redirect to /
│   └── api/
│       ├── site.ts          # GET  — public site data
│       ├── news.ts          # GET  — RSS items
│       └── admin/
│           ├── login.ts     # POST — returns bearer token
│           ├── links/       # GET/POST/PUT/DELETE — CRUD
│           └── config.ts    # GET/PUT — whitelisted config keys
├── components/              # FlagStripe, LangToggle, ProfilePanel, etc.
├── layouts/BaseLayout.astro # html/head/meta/JSON-LD/fonts
├── lib/
│   ├── i18n.ts              # translations + t(lang, key)
│   ├── site-data.ts         # getSiteData(db) — shared by SSR + /api/site
│   ├── news.ts              # getNewsItems() — RSS parser
│   ├── auth.ts              # sha256Hex, verifyToken
│   └── types.ts
└── styles/main.css

migrations/                  # D1 schema + seed data
public/                      # favicon, robots.txt, _headers, images/
```

## Local Development

```sh
npm install

# First time: apply migrations to local D1 replica
npm run db:migrate:local

# Set admin password for local dev
echo "ADMIN_PASSWORD=localdev" > .dev.vars

npm run dev   # http://localhost:4321
```

Visit `/` (English), `/fa/` (Farsi), or `/admin` (log in with the password from `.dev.vars`).

## Deploy

First deploy only — set the admin password as a Worker secret:

```sh
npx wrangler secret put ADMIN_PASSWORD
```

Apply migrations to the production D1 database:

```sh
npm run db:migrate
```

Deploy:

```sh
npm run deploy
```

## Editing Content

Almost everything is edited through the admin UI at `/admin`:

- **Banner** — enabled/disabled, type (info/urgent/success), text, link URL
- **Profile description** — English and Farsi paragraphs (the About section)
- **Site config** — contact email, last-updated date
- **Links** — add/edit/reorder/delete; each has title, URL, icon, category, featured flag

UI strings (button labels, section titles, etc.) live in code at `src/lib/i18n.ts`.

## Commands

| Command                 | Action                                        |
| :---------------------- | :-------------------------------------------- |
| `npm run dev`           | Start dev server at `localhost:4321`          |
| `npm run build`         | Build production bundle to `./dist/`          |
| `npm run preview`       | Build and preview locally                     |
| `npm run deploy`        | Build + `wrangler deploy`                     |
| `npm run db:migrate`    | Apply migrations to the remote D1             |
| `npm run db:migrate:local` | Apply migrations to the local D1 replica   |
| `npm run cf-typegen`    | Regenerate `worker-configuration.d.ts`        |
