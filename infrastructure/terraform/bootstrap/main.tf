# Named outside standwithiran-<env>-* so the role can't edit its own policy.
resource "aws_iam_role" "deploy" {
  for_each = var.environments

  name                 = "github-deploy-${local.project}-${each.key}"
  description          = "GitHub Actions deploy for ${var.github_repository} (${each.key})"
  assume_role_policy   = data.aws_iam_policy_document.trust[each.key].json
  max_session_duration = 3600
}

resource "aws_iam_role_policy" "deploy" {
  for_each = var.environments

  name   = "deploy"
  role   = aws_iam_role.deploy[each.key].id
  policy = data.aws_iam_policy_document.deploy[each.key].json
}


resource "aws_ssm_parameter" "cloudflare_api_token" {
  name             = "/standwithiran/cloudflare/api_token"
  description      = "Cloudflare API token for ${local.project} DNS (Zone:Read, DNS:Edit on the site zone)"
  type             = "SecureString"
  value_wo         = "placeholder-set-in-console"
  value_wo_version = 1

  lifecycle {
    ignore_changes = [value]
  }
}
