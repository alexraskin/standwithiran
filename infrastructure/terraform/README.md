# Infrastructure

Terraform for [standwithiran.org](https://standwithiran.org): a private S3 bucket behind CloudFront, an ACM certificate, and Cloudflare DNS records. Everything runs in `us-east-1`.

You don't need any of this to work on the site. It's for maintainers who deploy it.

## How deploys work

The [deploy workflow](../../.github/workflows/deploy.yml) runs on every push to `main` (or manually). It runs `tf:init`, builds and tests the site, plans, and applies. Terraform uploads `dist/` to S3. CSS and JS filenames are fingerprinted; HTML and sitemaps revalidate on every request.

## Prerequisites

- GitHub `prod` environment variables: `AWS_ROLE_ARN` (bootstrap output) and `AWS_REGION=us-east-1`.
- A Cloudflare API token with Zone:Read and DNS:Edit on the site zone, stored in the SSM SecureString `/standwithiran/cloudflare/api_token`. Bootstrap creates it with a placeholder; paste the real token in the SSM console. Terraform never reads the value back.
- AWS credentials for running Terraform locally.

## First-time setup

1. Apply `bootstrap/` to create the GitHub OIDC deploy role and the token parameter.
2. Set the token value in the SSM console.
3. From the repository root:

   ```sh
   mise run tf:init
   mise run tf:plan
   mise run tf:apply
   ```

`TF_ENV` defaults to `prod`. `tf:plan` builds and tests the site first; `tf:apply` applies the saved plan. Afterwards, check [standwithiran.org](https://standwithiran.org).
