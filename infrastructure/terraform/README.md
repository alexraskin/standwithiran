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

<!-- BEGIN_TF_DOCS -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.10 |
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | ~> 6.0 |
| <a name="requirement_cloudflare"></a> [cloudflare](#requirement\_cloudflare) | ~> 5.0 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_aws"></a> [aws](#provider\_aws) | 6.73.0 |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_acm"></a> [acm](#module\_acm) | ./modules/acm | n/a |
| <a name="module_cloudflare_dns"></a> [cloudflare\_dns](#module\_cloudflare\_dns) | ./modules/cloudflare_dns | n/a |
| <a name="module_cloudfront"></a> [cloudfront](#module\_cloudfront) | ./modules/cloudfront | n/a |
| <a name="module_s3"></a> [s3](#module\_s3) | ./modules/s3 | n/a |

## Resources

| Name | Type |
|------|------|
| [aws_caller_identity.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/caller_identity) | data source |
| [aws_iam_policy_document.site_bucket](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |
| [aws_ssm_parameter.cloudflare_api_token](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/ssm_parameter) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_aws_region"></a> [aws\_region](#input\_aws\_region) | Must be us-east-1: CloudFront only accepts ACM certificates from there. | `string` | n/a | yes |
| <a name="input_domain"></a> [domain](#input\_domain) | n/a | `string` | n/a | yes |
| <a name="input_environment"></a> [environment](#input\_environment) | n/a | `string` | n/a | yes |
| <a name="input_tags"></a> [tags](#input\_tags) | n/a | `map(string)` | `{}` | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_bucket_name"></a> [bucket\_name](#output\_bucket\_name) | n/a |
| <a name="output_distribution_domain"></a> [distribution\_domain](#output\_distribution\_domain) | n/a |
| <a name="output_distribution_id"></a> [distribution\_id](#output\_distribution\_id) | n/a |
<!-- END_TF_DOCS -->
