output "user_pool_id" {
  description = "ID of the Cognito User Pool"
  value       = aws_cognito_user_pool.user_pool.id
}

output "user_pool_client_id" {
  description = "ID of the Cognito User Pool Client"
  value       = aws_cognito_user_pool_client.client.id
}

output "user_pool_domain" {
  description = "Domain of the Cognito User Pool"
  value       = aws_cognito_user_pool_domain.user_pool_domain.domain
}


output "user_pool_arn" {
  description = "ARN of the Cognito User Pool"
  value       = aws_cognito_user_pool.user_pool.arn
}

output "user_pool_client_secret" {
  description = "Client secret of the Cognito User Pool Client"
  value       = aws_cognito_user_pool_client.client.client_secret
  sensitive   = true
}

# don't think we need this because i think WebView can get the cognito hosted url. just keeping incase we need it later.
# output "hosted_ui_endpoint" {
#   description = "Hosted UI endpoint URL"
#   value       = "https://${aws_cognito_user_pool.user_pool.domain}.auth.${data.aws_region.current.name}.amazoncognito.com"
# }