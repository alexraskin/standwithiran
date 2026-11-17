output "certificate_arn" {
  description = "ARN of the validated certificate; waits for validation."
  value       = aws_acm_certificate_validation.this.certificate_arn
}

output "validation_records" {
  value = {
    for o in aws_acm_certificate.this.domain_validation_options : o.domain_name => {
      name  = o.resource_record_name
      type  = o.resource_record_type
      value = o.resource_record_value
    }
  }
}
