# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

| Command | Action |
| :------ | :----- |
| `npm run dev` | Astro dev server at `localhost:4321` |
| `npm run check` | `astro check`: typecheck plus content-schema validation of `src/data/*.yaml` |
| `npm run build` | Static build to `./dist/` |
| `mise run build` | `npm ci` + check + build (what CI runs) |
| `mise run test` | `node --test` check for the CloudFront router function |
| `mise run tf:init` / `tf:plan` / `tf:apply` | Terraform for `$TF_ENV` (default `prod`). `tf:plan` depends on `build` and `test` |
| `mise run lint` | All pre-commit hooks (fmt, tflint, terraform-docs, gitleaks, actionlint, …) |

There is no unit test suite beyond the router check. Node 22 is required (pinned in `mise.toml`). First use needs `mise trust`.

## Architecture

The site is Astro 6 with static output (no adapter). It is served from a private S3 bucket behind CloudFront, and everything is built at deploy time. There is no server, database, admin UI or API.

### Content (YAML)

- **Where it lives:** all editable content is in `src/data/`.
  - `links.yaml` is an array of `{id, title, url, icon, category, featured, documentation}`. File order is display order. `featured` links lead /take-action/; `documentation` links appear on /victims/, /evidence/ and in the footer.
  - `timeline.yaml` is an array of `{id, year, title, title_fa, summary, summary_fa, featured}`, oldest first. `featured` entries show on the home page; /timeline/ shows all.
  - `reports.yaml` is an array of `{id, title, source, date, summary, url, category}` for /evidence/ (category from `REPORT_CATEGORIES`). Empty for now; the page falls back to the documentation links. Read with `getReports()`, not `getSiteData()`, because Astro warns on every read of an empty collection.
  - `site.yaml` holds one `main` entry with `banner`, `profile` (`description`, `description_fa`), `stats` (`amini`, `protest`, `blackout`, `war`), `contact_email` and `last_updated`.
- **Validation:** `src/content.config.ts` loads both files as content collections through `file()` and validates them with zod. The refinements reuse `src/lib/content-schema.ts`: `isHttpUrl`, `isIcon`, `isCategory`, `isBannerType`, `isIsoDateOrEmpty`. Bad content fails `astro check` and the build. Nothing else validates it.
- **Reading:** `getSiteData()` in `src/lib/site-data.ts` is the single reader (except reports), used by `BaseLayout`, the pages and `sitemap.xml.ts`. It returns `SiteData` (`src/lib/types.ts`). **Adding a content field means updating the YAML, the schema in `content.config.ts`, `SiteData` and `getSiteData`.**
- **Stat counters:**
  - `stats.war` has no entry in `DEFAULT_STAT_DATES`. While it is empty, `StatsPanel` omits the block and keeps three counters; setting it puts the war count first.
  - Day counts are rendered at build time as a no-JS fallback, then recomputed in the browser from each block's `data-since` (epoch ms) by the script in `StatsPanel.astro`. No rebuild is needed for them to advance.
- **Dates:** all of them are ISO `YYYY-MM-DD`. `last_updated` is localised for the footer by `formatDate` in `src/lib/i18n.ts`. It also feeds the sitemap `<lastmod>` and schema.org `dateModified`.

### i18n

Astro `i18n` declares `en` (default, no prefix) and `fa` (`/fa/`). UI strings are in `src/lib/i18n.ts`. Content strings (banner, profile, timeline) are in `src/data/`. Farsi pages set `dir="rtl"`, use Vazirmatn and no letter-spacing (`--track: 0`), and use `profile.description_fa` (shown on /timeline/).

Pages: the home page renders through `src/components/HomePage.astro` (`index.astro` and `fa/index.astro` only pick the language). The sections `timeline`, `victims`, `evidence`, `take-action` live in `src/pages/[...locale]/` and get both locales from `localeStaticPaths()`. `PAGES` in `i18n.ts` is the nav order and drives the header, footer and sitemap; `pageHref(lang, page)` builds links. `BaseLayout` renders the header, banner and footer and takes `page` (omitted only by 404, which is then noindex).

Styling is one stylesheet, `src/styles/main.css`, with design tokens on `:root`. The mobile menu is a native `popover`, no JS.

### Hosting (`infrastructure/terraform/`)

The layout follows the user's terraform conventions. The root config is shared, and environments differ only in `envs/<env>.{tfvars,backend.hcl}`. State lives in `alexraskin-tfstate` under `standwithiran/<env>/`. Everything runs in `us-east-1`, because CloudFront only accepts ACM certs from there.

`main.tf` only wires one module per service in `modules/`. The root builds the bucket policy (`data.tf`), because it needs ARNs from both `s3` and `cloudfront`. `moved.tf` maps the old flat addresses and can go once every env has applied.

- **`modules/s3`: bucket and upload.**
  - A private bucket `standwithiran-<env>-web-<account>`.
  - **`dist/` is uploaded by Terraform** as one `aws_s3_object` per file. This is the deploy, and removing a file from the build deletes its object.
  - Cache-Control is set per path: `_astro/` immutable, `.html`/`.xml` `max-age=0, must-revalidate`, everything else one day. So no CloudFront invalidation is needed.
- **`modules/acm`: cert** for the apex and www. Its validation records come from `cloudflare_dns`.
- **`modules/cloudfront`: distribution.** OAC, Managed-CachingOptimized, and 403/404 → `/404.html` with status 404.
- **`modules/cloudfront/router.js`: CloudFront Function (viewer-request).**
  - 301s `www.` to the apex.
  - Maps `/x/` and `/x` to `/x/index.html`.
  - Its check is `router.test.mjs`.
- **Response headers policy: security headers.** Sends `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, HSTS, `Permissions-Policy`, COOP and `Content-Security-Policy: frame-ancestors 'none'`.
- **`modules/cloudflare_dns`: Cloudflare records.** DNS stays on Cloudflare, so the ACM validation records and the DNS-only (`proxied = false`) apex/www CNAMEs live here. The CNAMEs are always enabled. The provider token comes from SSM `/infrastructure/cloudflare/api_token` (us-east-1).
- **`bootstrap/`: deploy role.** Applied by hand. It creates the GitHub OIDC role `github-deploy-standwithiran-<env>`, scoped to `standwithiran-<env>-*`, tag-scoped for CloudFront and ACM.

CI is `.github/workflows/deploy.yml`. It runs on push to main and on manual dispatch, using the `prod` environment with vars `AWS_ROLE_ARN`/`AWS_REGION`. The steps are `tf:init` → `tf:plan` → `tf:apply`.

### CSP

The CSP comes from `security.csp` in `astro.config.mjs`. Astro hashes the inline scripts and styles it emits. In static output the policy is a `<meta>` tag, and browsers ignore `frame-ancestors` there, so the CloudFront headers policy sends `frame-ancestors 'none'` as a header instead. Browsers enforce both policies. The JSON-LD block needs no hash, because `type="application/ld+json"` is a data block.

### SEO

`src/lib/seo.ts` is the single source for canonical URLs (`canonicalFor(lang, page)`), per-locale title/description/OG copy, per-section `pageSeo` (title doubles as the section `<h1>`), the home `<h1>` text and the OG image constants. **Changing site-wide meta copy means editing `seo.ts`, not `BaseLayout.astro`.** `BaseLayout` builds a schema.org `@graph` (WebSite + Organization + WebPage) and takes an optional `jsonLd` prop. /take-action/ uses it to pass an `ItemList` of the links via `resourcesItemList`.

`public/images/og-image.jpg` is a 1200x630 social card generated from the hero photo. Regenerate it if the hero art or wordmark changes, and keep `OG_IMAGE` in sync.

The favicon set is generated from `scripts/generate-icons.mjs`. Run `npm i --no-save sharp png-to-ico && node scripts/generate-icons.mjs`, and do not hand-edit the committed SVG or PNGs.

`src/pages/sitemap.xml.ts` is a static endpoint that emits every page in both locales with `hreflang` alternates, plus an image entry for the home pages. `404.astro` builds to `404.html`, and CloudFront serves it with a real 404 status.

## Conventions

- Do not add an adapter or `output: 'server'`. Hosting is static S3, and anything that needs a request-time server does not belong here.
- Changing a response header means editing the CloudFront response headers policy in `cloudfront.tf`. There is no middleware.
