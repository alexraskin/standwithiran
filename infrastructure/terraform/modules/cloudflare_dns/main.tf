resource "cloudflare_dns_record" "acm" {
  for_each = toset(var.hostnames)

  zone_id = data.cloudflare_zone.this.zone_id
  comment = var.cloudflare_comment
  name    = trimsuffix(var.acm_validation_records[each.key].name, ".")
  type    = var.acm_validation_records[each.key].type
  content = trimsuffix(var.acm_validation_records[each.key].value, ".")
  ttl     = 60
  proxied = false
}

# DNS only: proxying through Cloudflare would put a second CDN in front of CloudFront.
resource "cloudflare_dns_record" "this" {
  for_each = toset(var.hostnames)

  zone_id = data.cloudflare_zone.this.zone_id
  comment = var.cloudflare_comment
  name    = each.value
  type    = "CNAME"
  content = var.cname_target
  ttl     = 300
  proxied = false
}
