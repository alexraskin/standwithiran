# Stand With Iran

**Woman, Life, Freedom — زن، زندگی، آزادی**

An open-source, bilingual (English and Farsi) website supporting the people of Iran in their fight for freedom and human rights.

[standwithiran.org](https://standwithiran.org) · [فارسی](https://standwithiran.org/fa/)

## About

The site collects a historical timeline, memorial profiles of victims, published human-rights reports, and ways to take action, always linking back to original sources.

- **Bilingual**: English and Farsi, with full right-to-left support.
- **Static**: plain [Hugo](https://gohugo.io/), no server, accounts, or API.
- **Private**: no analytics, trackers, CDNs, or comments. Fonts and scripts are self-hosted behind a strict Content Security Policy.
- **Easy to edit**: every page is a Markdown file.

The design is a custom editorial theme built on [Archie](https://github.com/athul/archie). See [DESIGN.md](DESIGN.md).

## Quick start

You need [mise](https://mise.jdx.dev) and Python 3.11+. Nothing else to install.

```sh
git clone https://github.com/alexraskin/standwithiran.git
cd standwithiran
mise trust && mise install
mise run dev
```

Then open [localhost:4321](http://localhost:4321). Live reload is off (it conflicts with the CSP), so refresh after saving.

| Command | What it does |
| --- | --- |
| `mise run dev` | Local server at localhost:4321 |
| `mise run build` | Validate content, build to `dist/`, check pages and links |
| `mise run test` | Build and run all checks |
| `mise run lint` | Run pre-commit hooks |

## Contributing

Contributions are welcome, from both developers and non-developers. Good places to start:

- Fix a broken link or outdated source
- Improve or add a Farsi translation
- Correct a fact (please include the original source)
- Improve accessibility

Not comfortable editing files? [Open an issue](https://github.com/alexraskin/standwithiran/issues) instead.

Before opening a pull request, run `mise run test`, preview both languages, and add screenshots for visual changes. Keep source attribution intact, and don't merge figures from organizations that count differently.

## Writing content

Content lives in `content/` as Markdown with a small block of TOML metadata at the top:

```markdown
+++
title = "Title of the published report"
date = "2026-11-18"
source = "Publisher name"
source_url = "https://example.org/original-report"
category = "human_rights"
body_lang = "en"
+++

A short factual summary. Link to the original publication above.
```

Translations share a filename: `my-report.en.md` and `my-report.fa.md`. Start a new entry from a template with:

```sh
mise exec -- hugo new content evidence/my-report.en.md
```

New entries start as drafts. Set `draft = false` to publish; preview drafts with `mise exec -- hugo server --port 4321 --disableLiveReload --renderToMemory --buildDrafts`.

<details>
<summary>Content reference</summary>

| Path | Contents |
| --- | --- |
| `content/_index.*.md` | Home page introduction |
| `content/timeline/` | Historical events (section index holds background text) |
| `content/victims/` | Memorial profiles with source links |
| `content/evidence/` | Published reports |
| `content/resources/` | Action links and documentation organizations |
| `content/figures/` | Attributed figures shown on the victims page |
| `content/terms/`, `content/privacy/` | Policy pages |
| `hugo.toml` | Site settings, banner, contact email, counter dates |
| `i18n/*.toml` | Interface labels |

Allowed values:

- Report `category`: `human_rights`, `political_prisoners`, `executions`, `internet`, `womens_rights`, `protest_repression`
- Profile groups: `uprising_2022`, `executed`, `protests_2025_26`
- Resource categories: `information`, `organization`, `fundraiser`, `demonstration`, `news`

Conventions:

- Dates are `YYYY-MM-DD`; timeline `year` is `YYYY` or `YYYY–YYYY`.
- `weight` orders timeline entries and resources. Reports sort newest first; profiles oldest first.
- `featured = true` puts a timeline entry on the home page, or an action resource first.
- `documentation = true` shows an organization on the victims page and in the footer.
- Some reports and profiles only exist in English. Their Farsi copies keep `body_lang = "en"`; when you translate one, set `body_lang = "fa"`.
- Set `params.stats.war = ''` in `hugo.toml` to hide the war counter.

Timeline events, reports, and profiles get their own pages. Resources and figures appear inside other pages. The build rejects missing fields, unknown categories, and unsafe source URLs.

</details>

## Project layout

```
content/      Markdown pages (English and Farsi)
layouts/      Hugo templates (no external theme)
assets/       CSS and JS; archie.css is upstream, customize standwithiran.css
static/       Fonts, icons, images
scripts/      Build-time content and site checks
infrastructure/terraform/   Hosting (S3 + CloudFront + Cloudflare DNS)
```

Deployment is automated on pushes to `main`. Maintainers: see [infrastructure/terraform/README.md](infrastructure/terraform/README.md).

## License

Released under [The Unlicense](LICENSE). Archie's stylesheet keeps its MIT license in `assets/css/archie.css`; fonts keep their OFL notices in `static/fonts/`.
