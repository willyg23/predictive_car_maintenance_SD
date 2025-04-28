resource "aws_lambda_function" "api_lambda" {
  function_name = "${var.environment}-api-lambda"
  package_type  = "Image"
  architectures = ["arm64"]
  image_uri     = "${var.repository_url}:${var.lambda_image_tag}"
  role          = var.lambda_role_arn
  memory_size   = var.lambda_memory_size
  timeout       = var.lambda_timeout

  vpc_config {
    subnet_ids         = var.vpc_private_subnet_ids
    security_group_ids = [var.api_lambda_security_group_id]
  }

  environment {
    variables = {
      DB_USERNAME = var.DB_USERNAME
      DB_PASSWORD = var.DB_PASSWORD
      ENVIRONMENT = var.ENVIRONMENT
    }
  }

# TEMPORARY. NOT BEST PRACTICE.
# am using because the security groups created in the aws console to connect the lambda and database are not in terraform.
# as such, terraform tries to delete them (the security groups created in the aws console to connect the lambda and database)
# so this makes it so that terraform doesn't do that.
  lifecycle {
    ignore_changes = [
      vpc_config,  # This will ignore any changes to the VPC configuration
    ]
  }

  tags = {
    Environment = var.environment
    Name        = "${var.environment}-api-lambda"
  }
}
