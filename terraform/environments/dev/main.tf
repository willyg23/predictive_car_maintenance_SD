module "test_bucket" {
  source      = "../../modules/storage/s3/test_bucket"
  environment = "dev"
}

module "networking" {
  source      = "../../modules/networking"
  environment = "dev"
}

module "ecr" {
  source          = "../../modules/ecr"
  environment     = "dev"
  repository_name = "dev_ecr"
}

# VPC Endpoints Module
# module "vpc_endpoints" {
#   source = "../../modules/networking/vpc_endpoints"

#   environment           = "dev"
#   region                = "us-east-2"
#   vpc_id                = module.networking.vpc_main_id
#   private_subnet_ids    = module.networking.private_subnet_ids
#   ec2_security_group_id = module.networking.ec2_security_group_id
# }

module "api_gateway" {
  source                   = "../../modules/api_gateway"
  environment              = "dev"
  vpc_id                   = module.networking.vpc_main_id
  lambda_invoke_arn        = module.lambda.invoke_arn
  lambda_function_name     = module.lambda.lambda_function_name
  cloudwatch_log_group_arn = module.cloudwatch.api_access_log_group_arn
}

module "cloudwatch" {
  source      = "../../modules/cloudwatch"
  environment = "dev"
}

module "database" {
  source                = "../../modules/database"
  environment           = "dev"
  rds_subnet_group_name = module.networking.rds_subnet_group_name
  rds_security_group_id = module.networking.rds_security_group_id
  DB_PASSWORD           = var.DB_PASSWORD
  DB_USERNAME           = var.DB_USERNAME

}

module "lambda_iam" {
  source      = "../../global/iam/compute/lambda"
  environment = "dev"
}

module "security_groups" {
  source      = "../../modules/networking/security_groups"
  environment = "dev"
  vpc_main_id = module.networking.vpc_main_id
}

module "lambda" {
  source                       = "../../modules/compute/lambda"
  environment                  = "dev"
  DB_PASSWORD                  = var.DB_PASSWORD
  DB_USERNAME                  = var.DB_USERNAME
  ENVIRONMENT                  = var.ENVIRONMENT
  repository_registry_id       = module.ecr.repository_registry_id
  repository_arn               = module.ecr.repository_arn
  repository_name              = module.ecr.repository_name
  repository_url               = module.ecr.repository_url
  vpc_private_subnet_ids       = module.networking.private_subnet_ids
  lambda_role_arn              = module.lambda_iam.lambda_execution_role_arn
  api_lambda_security_group_id = module.security_groups.api_lambda_security_group_id

}

module "auth" {
  source       = "../../modules/auth"
  environment  = "dev"
  app_domain   = "app-fix-it"
  callback_url = "app://callback"
  logout_url   = "app://logout"

  /*
    plan with logout_url:

    when user successfully signs in through Cognito hosted UI in WebView
    cognito redirects to this dummy url:   callback_url = "app://callback"
    mobile app intercepts this URL in WebView
    app can then navigate user to appropriate screen (like home screen)
    keeps authentication flow within the app

    plan with callback_url:

    when user successfully signs in through Cognito hosted UI in WebView
    cognito redirects to this custom URL scheme
    mobile app intercepts this URL in WebView
    app can then navigate user to appropriate screen (like home screen)
    keeps authentication flow within the app
  */
}