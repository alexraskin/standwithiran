resource "aws_s3_bucket" "this" {
  bucket = var.bucket
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket                  = aws_s3_bucket.this.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "this" {
  bucket = aws_s3_bucket.this.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_policy" "this" {
  bucket = aws_s3_bucket.this.id
  policy = var.policy
}

# The build output is the deploy: plan reads dist/, so `mise run tf:plan` builds first.
resource "aws_s3_object" "this" {
  for_each = local.files

  bucket       = aws_s3_bucket.this.id
  key          = each.value
  source       = "${var.site_dir}/${each.value}"
  etag         = filemd5("${var.site_dir}/${each.value}")
  content_type = lookup(local.mime, reverse(split(".", each.value))[0], "application/octet-stream")
  cache_control = (
    startswith(each.value, "_astro/") ? local.cache_immutable :
    can(regex("\\.(html|xml)$", each.value)) ? local.cache_html :
    local.cache_static
  )
}
