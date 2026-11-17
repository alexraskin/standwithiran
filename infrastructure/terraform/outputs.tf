output "bucket_name" {
  value = module.s3.bucket_id
}

output "distribution_id" {
  value = module.cloudfront.distribution_id
}

output "distribution_domain" {
  value = module.cloudfront.distribution_domain
}
