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

# apparently HTTP apis do not have execution logging. https://stackoverflow.com/questions/62534433/how-to-enable-execution-logs-for-a-http-api-gateway
# as of rn i'm using an HTTP api so ig that this is kinda useless but ima keep it cause it might be useful later. like if we ever use a REST api instead.
resource "aws_cloudwatch_log_group" "api_gateway_execution_logs" {
  name              = "${var.api_log_prefix}-${var.environment}-api-execution-logs"
  retention_in_days = var.retention_days

  tags = {
    Environment = var.environment
    Name        = "${var.environment}-api-execution-logs"
  }
}