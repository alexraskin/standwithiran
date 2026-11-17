variable "hostnames" {
  type        = list(string)
  description = "First is the certificate's domain name, the rest are SANs."
}

variable "validation_record_fqdns" {
  type        = list(string)
  description = "DNS validation records, created outside this module from validation_records."
}
