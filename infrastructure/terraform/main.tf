module "s3" {
  source = "./modules/s3"

  bucket   = "${local.name}-web-${data.aws_caller_identity.current.account_id}"
  policy   = data.aws_iam_policy_document.site_bucket.json
  site_dir = "${path.module}/../../dist"
}

module "acm" {
  source = "./modules/acm"

  hostnames               = local.hostnames
  validation_record_fqdns = module.cloudflare_dns.acm_record_fqdns
}

module "cloudfront" {
  source = "./modules/cloudfront"

  name                        = local.name
  aliases                     = local.hostnames
  certificate_arn             = module.acm.certificate_arn
  bucket_regional_domain_name = module.s3.bucket_regional_domain_name
}

module "cloudflare_dns" {
  source = "./modules/cloudflare_dns"

  zone                   = var.domain
  hostnames              = local.hostnames
  acm_validation_records = module.acm.validation_records
  cname_target           = module.cloudfront.distribution_domain
  cloudflare_comment     = local.cloudflare_comment
}
