# Repository guide

## Commands

- `mise run dev`: Hugo server on port 4321, live reload disabled for CSP.
- `mise run build`: Hugo content validation and static build, then generated-site tests.
- `mise run test`: build and run the Python content and generated-site checks.
- `mise run lint`: configured pre-commit checks.
- `mise run tf:init`, `tf:plan`, `tf:apply`: existing Terraform workflow. Plan builds and tests first.

## Site architecture

Hugo 0.166.0, no theme; templates live in root `layouts/`. No runtime server, Node tooling, accounts, or API. Checks use Python 3.11+ standard library only. Hugo writes `dist/`; Terraform uploads it to the existing private S3 bucket behind CloudFront.

Editorial content is Markdown with TOML front matter in `content/`. `.en.md` and `.fa.md` files pair translations. English uses `/`, Farsi `/fa/`. Page metadata stays in front matter and prose stays in the Markdown body. UI strings are in `i18n/`; site settings are in `hugo.toml`.

`assets/css/archie.css` is Archie's upstream base stylesheet; `assets/css/standwithiran.css` is layered after it. Preserve the MIT license and commit marker in its header, and put site customizations in `standwithiran.css`.

`layouts/partials/validate.html` validates records at build time. Update it and the authoring guide when adding metadata. Resource and figure collections use headless sections, and are accessed through their section's `.RegularPages`. Preserve source URLs, grouping, order, and attribution. Existing English-only report/profile bodies are marked with `body_lang` even on Farsi pages.

`assets/js/site.js` updates server-rendered counters and handles copy-link feedback. War is optional. All dates use UTC for counter calculations. Hugo fingerprints the CSS and JS.

The strict CSP is emitted in `layouts/partials/header.html`; all executable scripts and styles are external local files. Fonts are self-hosted in `static/fonts/`. No CDN, analytics, Disqus, or inline event handlers. CloudFront supplies frame-ancestors and other response security headers.

SEO metadata and language alternates are emitted in the head partial. Hugo generates language sitemaps and a sitemap index. The 404 template is noindex and CloudFront preserves its 404 status. Markdown entry pages augment the original section URLs.

## Infrastructure

Do not add a server or change hosting as part of theme work. Terraform lives in `infrastructure/terraform/`, with per-service modules, environment config in `envs/`, and bootstrap for the GitHub OIDC role. Cloudflare hosts DNS; S3 and CloudFront serve the site. All infrastructure runs in us-east-1.

CI runs `tf:init` → `tf:plan` → `tf:apply`; plan depends on build and content/site checks. Terraform uploads `dist/`. HTML/XML revalidate, static assets cache for a day, and the obsolete Astro cache rule has been removed.

## Assets

Images, icons, and fonts live in `static/`. Existing generated assets are retained. Maintain them directly; the old Node-based image generators and npm manifests have been removed.

## Checks

`python3 scripts/check_site.py` checks the built bilingual routes, local links and assets, source attribution, and rejection of invalid content. The old Node CloudFront router test harness was removed; these checks do not execute the CloudFront JavaScript runtime.
