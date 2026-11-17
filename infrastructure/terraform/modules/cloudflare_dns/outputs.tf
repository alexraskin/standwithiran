output "acm_record_fqdns" {
  value = [for r in cloudflare_dns_record.acm : r.name]
}
