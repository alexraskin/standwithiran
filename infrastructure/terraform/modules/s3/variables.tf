variable "bucket" {
  type = string
}

variable "policy" {
  type        = string
  description = "Bucket policy JSON."
}

variable "site_dir" {
  type        = string
  description = "Built static site to upload. Removing a file here deletes its object."
}
