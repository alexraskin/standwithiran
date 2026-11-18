# Stand With Iran

An open-source website supporting the people of Iran in their fight for freedom and human rights, in English and Farsi.

**Woman, Life, Freedom — زن، زندگی، آزادی**

[Visit the website](https://standwithiran.org) · [فارسی](https://standwithiran.org/fa/)

Built with [Hugo](https://gohugo.io/) and a custom editorial theme based on [Archie](https://github.com/athul/archie): warm paper, burgundy links, serif headings, and a compact reading layout. Editorial content lives in Markdown. The site is static, bilingual, and supports right-to-left Farsi.

## Getting started

Install [mise](https://mise.jdx.dev), then run:

```sh
mise trust
mise install
mise run build
mise run dev
```

Open [localhost:4321](http://localhost:4321). No AWS credentials are needed to develop or build the site. Hugo is pinned in `mise.toml` and `mise.lock`. The checks use Python 3.11+ and its standard library; no packages need installing. Live reload is disabled to keep the site's strict Content Security Policy intact; refresh after saving.

| Command | Description |
| --- | --- |
| `mise run dev` | Run Hugo at localhost:4321 |
| `mise run build` | Validate content, build to `dist/`, and check pages and links |
| `mise run test` | Build and run content, route, and source-link checks |
| `mise run lint` | Run the repository's pre-commit checks |

## Writing content

Edit Markdown in `content/`. The short block between `+++` markers is TOML metadata; everything below it is ordinary Markdown. Paragraphs, headings, lists, emphasis, and links work without YAML quoting or indentation.

| Folder | Contents |
| --- | --- |
| `content/_index.en.md`, `_index.fa.md` | Home introduction |
| `content/timeline/` | Historical events; the section index contains background text |
| `content/victims/` | Memorial profiles with original source links |
| `content/evidence/` | Published reports |
| `content/resources/` | Action links and documentation organizations |
| `content/figures/` | Individually attributed figures for the victims page |
| `content/terms/`, `content/privacy/` | Policy pages |
| `hugo.toml` | Site settings, banner, contact email, counter dates |
| `i18n/en.toml`, `i18n/fa.toml` | Short interface labels |

For example, a report looks like this:

```markdown
+++
title = "Title of the published report"
date = "2026-11-18"
source = "Publisher name"
source_url = "https://example.org/original-report"
category = "human_rights"
body_lang = "en"
+++

Write a short factual summary here. Link to the original publication above.

Add more paragraphs, **emphasis**, or a list when useful.
```

Use the same filename with `.en.md` and `.fa.md` suffixes for translations. The URLs remain `/timeline/`, `/victims/`, `/evidence/`, `/take-action/`, `/terms/`, `/privacy/` and their `/fa/` equivalents. Timeline events, reports and profiles also have individual pages. Resources and attributed figures are included in other pages without generating standalone URLs.

Existing report and profile summaries were only available in English. Their Farsi-page copies preserve that text and mark it `body_lang = "en"`; translating them is a separate editorial task. When translating a report, change `body_lang` to `"fa"` as well as its title and body.

Create a draft from a template:

```sh
mise exec -- hugo new content evidence/my-report.en.md
```

Add its `.fa.md` counterpart, fill in the metadata and body, then set `draft = false` to publish. Drafts are excluded from normal builds; use `mise exec -- hugo server --port 4321 --disableLiveReload --renderToMemory --buildDrafts` to preview them.

- Report categories: `human_rights`, `political_prisoners`, `executions`, `internet`, `womens_rights`, `protest_repression`.
- Profile groups: `uprising_2022`, `executed`, `protests_2025_26`.
- Resource categories: `information`, `organization`, `fundraiser`, `demonstration`, `news`.
- Dates use `YYYY-MM-DD`. Timeline `year` uses `YYYY` or `YYYY–YYYY`.
- `weight` controls timeline and resource order. Reports sort newest first within categories; profiles sort oldest first within groups.
- Set `featured = true` to show a timeline entry on the home page or an action resource first. Set `documentation = true` for organizations that appear on the victims page and in the footer.
- Set `params.stats.war = ''` in `hugo.toml` to hide the war counter. Counters render without JavaScript and update in the browser.

The build rejects missing required fields, invalid categories, and unsafe source URLs. Run `mise run build` and preview both languages before submitting changes. Preserve source attribution and do not merge figures from organizations with different counting methods.

## Theme development

There is no Hugo theme. Archie's base stylesheet is copied, with its MIT license and upstream commit, into `assets/css/archie.css`. Leave that file as the upstream baseline and make site-specific changes in:

- `layouts/`: Hugo templates and partials.
- `assets/css/standwithiran.css`: custom styles layered over Archie's stylesheet.
- `assets/js/site.js`: counters and sharing.
- `static/`: fonts, licenses, icons, and the social image.

[DESIGN.md](DESIGN.md) records the custom theme. Fonts, scripts and styles are served locally, with no analytics or comments. The HTML CSP allows only local assets; CloudFront continues to send its existing security headers.

Images and icons are maintained directly in `static/`. The old Node-based asset generators have been removed; the current generated assets are retained.

## Contributing

Contributions are welcome: fix links, improve translations, correct sourced content, or improve accessibility. Make a focused change, run `mise run build` and `mise run test`, and include screenshots for visual changes. For factual corrections, include original sources. You can also open an issue instead of editing code.

## Deployment

The production site runs on a private S3 bucket behind CloudFront, with an ACM certificate and Cloudflare DNS. Infrastructure is defined in [infrastructure/terraform/](infrastructure/terraform/).

The [deployment workflow](.github/workflows/deploy.yml) runs on pushes to `main` and can also be triggered manually. It initializes Terraform, builds and tests the site, creates a plan, and applies it. Terraform uploads `dist/` to S3. Hugo writes to the same `dist/` directory. CSS and JavaScript filenames are fingerprinted; HTML and sitemaps revalidate on every request.

Maintainers need:

- GitHub `prod` environment variables `AWS_ROLE_ARN` (from the bootstrap output) and `AWS_REGION=us-east-1`.
- A Cloudflare API token (Zone:Read and DNS:Edit on the site zone). Bootstrap creates the SecureString `/standwithiran/cloudflare/api_token` in `us-east-1` with a placeholder; paste the real token into it in the SSM console. Terraform never reads the value back.
- AWS credentials for local Terraform commands.

For initial setup, apply the configuration in `infrastructure/terraform/bootstrap/` to create the GitHub OIDC deployment role and the token parameter, and set the token value in the SSM console. Then, from the repository root, run:

```sh
mise run tf:init
mise run tf:plan
mise run tf:apply
```

These commands use `TF_ENV=prod` by default. The plan task builds the site and runs the content and generated-site checks; the apply task applies the saved plan. Terraform manages the bucket, certificate, CloudFront distribution, certificate validation records, and DNS-only apex/www records. After deployment, verify [standwithiran.org](https://standwithiran.org).

## License

Project code is released under [The Unlicense](LICENSE). Archie's stylesheet retains its MIT license in the header of `assets/css/archie.css`; self-hosted fonts retain their OFL notices in `static/fonts/`.
