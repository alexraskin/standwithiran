variable "name" {
  type = string
}

variable "aliases" {
  type = list(string)
}

variable "certificate_arn" {
  type        = string
  description = "Validated us-east-1 ACM certificate covering every alias."
}

variable "bucket_regional_domain_name" {
  type = string
}
