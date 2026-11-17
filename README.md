# Stand With Iran ✊

Website supporting the people of Iran in their fight for freedom and human rights. Curates resources, organizations, and fundraisers.

**Woman, Life, Freedom — زن، زندگی، آزادی**

A static [Astro](https://astro.build) site served from S3 behind CloudFront. Content lives in YAML in this repo.

## Stack

- **Astro 6**, static output. English at `/`, Farsi (RTL) at `/fa/`.
- **Content** in `src/data/*.yaml`, validated at build time by `src/content.config.ts`.
- **AWS**: a private S3 bucket behind CloudFront with OAC, plus an ACM cert. Defined in `infrastructure/terraform/`.
- **DNS** stays on Cloudflare as DNS-only CNAMEs to CloudFront, managed by the same Terraform.

## Editing content

Edit, commit, push to `main`. CI rebuilds and deploys.

| File | What |
| :--- | :--- |
| `src/data/links.yaml` | Resource links. File order is display order. `icon`/`category` must be in `src/lib/content-schema.ts`. |
| `src/data/site.yaml` | Banner, profile (EN + FA), stat counter dates, contact email, `last_updated` |
| `src/lib/i18n.ts` | UI strings |

Dates are ISO `YYYY-MM-DD`. Leave `stats.war` as `""` to hide that counter. If the YAML is invalid, `npm run check` / `npm run build` fails and names the field.

The day counters update in the browser from the start dates, so they stay current without a rebuild.

## Local development

```sh
mise trust && mise install
npm install
npm run dev        # http://localhost:4321
```

## Deploy

CI (`.github/workflows/deploy.yml`) runs `mise run tf:init`, then `tf:plan` (which runs `build` first), then `tf:apply`. Terraform uploads `dist/` as S3 objects:

- `_astro/` is immutable.
- HTML and the sitemap revalidate on every request, so no invalidation is needed.

GitHub `prod` environment needs vars `AWS_ROLE_ARN` (bootstrap output) and `AWS_REGION=us-east-1`. The Cloudflare token is read from SSM `/infrastructure/cloudflare/api_token` (us-east-1).

Locally: `mise run tf:init tf:plan tf:apply` with AWS creds.

### First-time setup

1. `cd infrastructure/terraform/bootstrap && terraform init && terraform apply` creates the GitHub OIDC deploy role.
2. Run `mise run tf:init tf:plan tf:apply` to create the bucket, cert, CloudFront, ACM validation records, and apex/www DNS records.
3. Smoke test the site at `https://standwithiran.org`.

The apex/www DNS records are always managed by Terraform.

## Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run check` | `astro check`: typecheck + content schema |
| `mise run build` | `npm ci` + check + build to `dist/` |
| `mise run test` | CloudFront router function check |
| `mise run tf:plan` / `tf:apply` | Build, then plan/apply (`TF_ENV`, default `prod`) |
| `mise run lint` | All pre-commit hooks |
