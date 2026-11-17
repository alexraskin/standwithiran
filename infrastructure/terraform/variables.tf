variable "environment" {
  type = string
  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "environment must be dev or prod."
  }
}

variable "aws_region" {
  type        = string
  description = "Must be us-east-1: CloudFront only accepts ACM certificates from there."
}

variable "domain" {
  type = string
}

variable "tags" {
  type    = map(string)
  default = {}
}
