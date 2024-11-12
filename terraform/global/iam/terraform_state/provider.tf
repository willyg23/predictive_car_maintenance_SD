provider "aws" {
  region = "us-east-2"
}

/* Needed to get account ID for IAM user ARN, as the policies in terraform_state_policy.tf use specific IAM users
automatically gets the account ID for the IAM user ARN, no hardcoded input needed. */
data "aws_caller_identity" "current" {}
