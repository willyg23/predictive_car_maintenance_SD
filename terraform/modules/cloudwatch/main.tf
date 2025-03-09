resource "aws_cloudwatch_log_group" "rds_postgresql_log_group" {
  name              = "${var.rds_log_group_prefix}-${var.environment}-postgresql-logs"
  retention_in_days = var.retention_days

  tags = {
    Environment = var.environment
    Name        = "${var.environment}-postgresql-logs"
  }
}

resource "aws_cloudwatch_log_group" "rds_upgrade_log_group" {
  name              = "${var.rds_log_group_prefix}-${var.environment}-upgrade-logs"
  retention_in_days = var.retention_days

  tags = {
    Environment = var.environment
    Name        = "${var.environment}-upgrade-logs"
  }
}

resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
  name              = "${var.vpc_log_prefix}-${var.environment}-vpc-flow-logs"
  retention_in_days = var.retention_days

  tags = {
    Environment = var.environment
    Name        = "${var.environment}-vpc-flow-logs"
  }
}

resource "aws_cloudwatch_log_group" "api_gateway_access_logs" {
  name              = "${var.api_log_prefix}-${var.environment}-api-access-logs"
  retention_in_days = var.retention_days

  tags = {
    Environment = var.environment
    Name        = "${var.environment}-api-access-logs"
  }
}

resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.environment}-api-lambda"
  retention_in_days = var.retention_days

  tags = {
    Environment = var.environment
    Name        = "${var.environment}-lambda-logs"
  }
}


# resource "aws_cloudwatch_log_group" "api_gateway_execution_logs" {
#   name              = "${var.api_log_prefix}-${var.environment}-api-execution-logs"
#   retention_in_days = var.retention_days

#   tags = {
#     Environment = var.environment
#     Name        = "${var.environment}-api-execution-logs"
#   }
# }

# resource "aws_api_gateway_method_settings" "execution_logs" {
#   rest_api_id = aws_api_gateway_rest_api.api.id
#   stage_name  = aws_api_gateway_stage.stage.stage_name
#   method_path = "*/*" # Applies to all methods

#   settings {
#     logging_level = "INFO"
#     # Can be "OFF", "ERROR", or "INFO"
#     # OFF == disables execution logging
#     # ERROR == only logs errors
#     # INFO == logs all events
#   }
# }

