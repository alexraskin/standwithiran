variable "zone" {
  type = string
}

variable "hostnames" {
  type = list(string)
}

variable "acm_validation_records" {
  type = map(object({
    name  = string
    type  = string
    value = string
  }))
  description = "Keyed by hostname, from the acm module."
}

variable "cname_target" {
  type = string
}

variable "cloudflare_comment" {
  type = string
}
