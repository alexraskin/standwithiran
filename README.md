# Stand With Iran

An open-source website supporting the people of Iran in their fight for freedom and human rights. It brings together resources, organizations, fundraisers, and historical context in English and Farsi.

**Woman, Life, Freedom — زن، زندگی، آزادی**

[Visit the website](https://standwithiran.org) · [فارسی](https://standwithiran.org/fa/)

Built with [Astro](https://astro.build) and TypeScript. The site generates static HTML, supports right-to-left Farsi layouts, and keeps its content in editable YAML files.

## Getting started

Install [mise](https://mise.jdx.dev), then clone your fork or a local copy of this repository. From the project directory, install the configured tools and dependencies, build the site, and start the development server:

```sh
mise trust
mise install
mise run build
mise run dev
```

Open [localhost:4321](http://localhost:4321). Local development does not require AWS or Cloudflare credentials.

Tool versions and development tasks are configured in [mise.toml](mise.toml).

## Development

| Command | Description |
| --- | --- |
| `mise run dev` | Start the development server |
| `mise run build` | Install dependencies, run type and content checks, and build to `dist/` |
| `mise run test` | Run the CloudFront router tests |
| `mise run lint` | Run the configured pre-commit checks |

Pages live in `src/pages/`, shared components in `src/components/`, and styles in `src/styles/`. English pages use `/`; Farsi pages use `/fa/`.

## Updating content

Most content changes do not require editing components:

| File | Contents |
| --- | --- |
| [src/data/links.yaml](src/data/links.yaml) | Resource links, organizations, and fundraisers |
| [src/data/timeline.yaml](src/data/timeline.yaml) | Historical events with English and Farsi titles and summaries |
| [src/data/reports.yaml](src/data/reports.yaml) | Published reports for the evidence page |
| [src/data/site.yaml](src/data/site.yaml) | Banner, site description, counter dates, contact email, and last-updated date |
| [src/lib/i18n.ts](src/lib/i18n.ts) | Translated interface text |

Follow the existing entries and comments when adding content. Use original sources for reports and include the publisher, publication date, and a short factual summary. Keep English and Farsi text in sync where both are provided.

Content is validated by [src/content.config.ts](src/content.config.ts). Supported icons and categories are defined in [src/lib/content-schema.ts](src/lib/content-schema.ts). Dates use `YYYY-MM-DD`; timeline years use `YYYY` or `YYYY–YYYY`. Set `stats.war` to `""` to hide that counter. Day counters update in the browser without a rebuild.

Run `mise run build` after editing content, then preview the affected pages in both languages.

## Contributing

Contributions are welcome: fix broken links, suggest resources, improve translations, correct content, or help with accessibility and design.

1. Open an issue to report a bug, suggest a resource, or discuss a larger change. Include sources for factual corrections.
2. Fork the repository and create a branch for your change.
3. Make a focused change and run `mise run build`. For CloudFront router changes, also run `mise run test`.
4. Open a pull request explaining what changed and how you checked it. Include screenshots for visual changes.

You can also open an issue with a suggested correction if you prefer not to edit the code.

## Deployment

The production site runs on a private S3 bucket behind CloudFront, with an ACM certificate and Cloudflare DNS. Infrastructure is defined in [infrastructure/terraform/](infrastructure/terraform/).

The [deployment workflow](.github/workflows/deploy.yml) runs on pushes to `main` and can also be triggered manually. It initializes Terraform, builds and tests the site, creates a plan, and applies it. Terraform uploads `dist/` to S3. Assets under `_astro/` are immutable; HTML and the sitemap revalidate on every request.

Maintainers need:

- GitHub `prod` environment variables `AWS_ROLE_ARN` (from the bootstrap output) and `AWS_REGION=us-east-1`.
- A Cloudflare API token stored in AWS SSM at `/infrastructure/cloudflare/api_token` in `us-east-1`.
- AWS credentials for local Terraform commands.

For initial setup, apply the configuration in `infrastructure/terraform/bootstrap/` to create the GitHub OIDC deployment role. Then, from the repository root, run:

```sh
mise run tf:init
mise run tf:plan
mise run tf:apply
```

These commands use `TF_ENV=prod` by default. The plan task builds the site and runs the router tests; the apply task applies the saved plan. Terraform manages the bucket, certificate, CloudFront distribution, certificate validation records, and DNS-only apex/www records. After deployment, verify [standwithiran.org](https://standwithiran.org).

## License

Released under [The Unlicense](LICENSE).
