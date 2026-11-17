locals {
  project = "standwithiran"
  tags = {
    Project     = local.project
    Environment = "bootstrap"
    ManagedBy   = "terraform"
  }
  state_bucket = "alexraskin-tfstate"
  account_id   = data.aws_caller_identity.current.account_id
}
