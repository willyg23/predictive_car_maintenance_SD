variable "environment" {
  description = "Environment (like prod, dev, or sandbox)"
  type        = string
  # this does not have a default, as we specify the environment variable when we create the resource in the main.tf of the dev or prod folder
}

variable "app_domain" {
  description = "Domain prefix for Cognito hosted UI"
  type        = string
}

variable "callback_url" {
  description = "Callback URL for Cognito hosted UI"
  type        = string
}

variable "logout_url" {
  description = "Logout URL for Cognito hosted UI"
  type        = string
}
