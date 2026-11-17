# us-east-1 for everything: CloudFront only accepts ACM certificates from there.
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.tags
  }
}

provider "cloudflare" {
  api_token = data.aws_ssm_parameter.cloudflare_api_token.value
}
