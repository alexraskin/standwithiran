locals {
  tags = merge(var.tags, {
    Project     = "standwithiran"
    Environment = var.environment
    ManagedBy   = "terraform"
  })
  name = "standwithiran-${var.environment}"

  cloudflare_comment = "managed-by:terraform;application:standwithiran"

  hostnames = [var.domain, "www.${var.domain}"]
}
