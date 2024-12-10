module "test_bucket" {
  source      = "../../modules/storage/s3/test_bucket"
  environment = "dev"
}

module "networking" {
  source      = "../../modules/networking"
  environment = "dev"
}

module "monitoring" {
  source      = "../../modules/monitoring/cloudwatch"
  environment = "dev"
}

module "ecr" {
  source          = "../../modules/ecr"
  environment     = "dev"
  repository_name = "dev_ecr"
}

module "load_balancer" {
  source = "../../modules/load_balancer"

  environment           = "dev"
  vpc_id                = module.networking.vpc_main_id
  public_subnet_ids     = module.networking.public_subnet_ids
  alb_security_group_id = module.networking.alb_security_group_id
}

module "auto_scaling" {
  source = "../../modules/auto_scaling"

  environment           = "dev"
  vpc_id                = module.networking.vpc_main_id
  public_subnet_ids     = module.networking.public_subnet_ids
  ecs_security_group_id = module.networking.ecs_security_group_id
  target_group_arn      = module.load_balancer.target_group_arn
  ecr_repository_url    = module.ecr.repository_url
  ec2_security_group_id = module.networking.ec2_security_group_id
  instance_profile_name = module.ec2_iam.instance_profile_name

}

# VPC Endpoints Module
module "vpc_endpoints" {
  source = "../../modules/networking/vpc_endpoints"

  environment           = "dev"
  region                = "us-east-2"
  vpc_id                = module.networking.vpc_main_id
  private_subnet_ids    = module.networking.private_subnet_ids
  ec2_security_group_id = module.networking.ec2_security_group_id
}

# EC2 IAM Role Module
module "ec2_iam" {
  source      = "../../global/iam/compute/ec2"
  environment = "dev"
  region      = "us-east-2"
}

module "api_gateway" {
  source           = "../../modules/api_gateway"
  environment      = "dev"
  alb_dns_name     = module.load_balancer.alb_dns_name
  alb_listener_arn = module.load_balancer.alb_listener_arn
  vpc_id           = module.networking.vpc_main_id
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