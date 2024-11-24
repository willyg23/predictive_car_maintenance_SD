resource "aws_cognito_user_pool" "user_pool" {
  name = "${var.environment}-user-pool"

  mfa_configuration = "OFF" # Change to ON once / if we're start doing SMS

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  # standard setting that automatically sends verification emails when users sign up
  auto_verified_attributes = ["email"]

  # add UI customization settings
  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  deletion_protection = "ACTIVE"

  tags = {
    Environment = var.environment
    Name        = "${var.environment}-user-pool"
  }

}

# Add User Pool Client for hosted UI
resource "aws_cognito_user_pool_client" "client" {
  name = "${var.environment}-cognito-app-client"

  user_pool_id = aws_cognito_user_pool.user_pool.id

  generate_secret = false # Only needed if using confidential clients (server-side apps). mobile apps are public clients.

  # OAuth settings
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                 = ["email", "openid", "profile"]

  callback_urls = ["${var.callback_url}"] # You'll need to add var.callback_url
  logout_urls   = ["${var.logout_url}"]   # You'll need to add var.logout_url

  supported_identity_providers = ["COGNITO"] # Add social providers here later. add gmail first i think

}

resource "aws_cognito_user_pool_domain" "user_pool_domain" {
  domain       = "${var.environment}-${var.app_domain}"
  user_pool_id = aws_cognito_user_pool.user_pool.id
}
