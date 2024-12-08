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

resource "aws_cloudwatch_log_group" "ec2_instance_logs" {
  name              = "${var.ec2_log_group_prefix}-${var.environment}-ec2-logs"
  retention_in_days = var.retention_days

  tags = {
    Environment = var.environment
    Name        = "${var.environment}-ec2-logs"
  }
}

resource "aws_cloudwatch_log_group" "ecs_container_logs" {
  name              = "${var.ecs_log_group_prefix}-${var.environment}-ecs-logs"
  retention_in_days = var.retention_days

  tags = {
    Environment = var.environment
    Name        = "${var.environment}-ecs-logs"
  }
}

resource "aws_cloudwatch_log_group" "auto_scaling_group_logs" {
  name              = "${var.auto_scaling_group_log_prefix}-${var.environment}-auto-scaling-group-logs"
  retention_in_days = var.retention_days

  tags = {
    Environment = var.environment
    Name        = "${var.environment}-auto-scaling-group-logs"
  }
}

resource "aws_cloudwatch_log_group" "load_balancer_access_logs" {
  name              = "${var.load_balancer_log_prefix}-${var.environment}-lb-access-logs"
  retention_in_days = var.retention_days

  tags = {
    Environment = var.environment
    Name        = "${var.environment}-lb-access-logs"
  }
}

resource "aws_cloudwatch_log_group" "load_balancer_error_logs" {
  name              = "${var.load_balancer_log_prefix}-${var.environment}-lb-error-logs"
  retention_in_days = var.retention_days

  tags = {
    Environment = var.environment
    Name        = "${var.environment}-lb-error-logs"
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

# resource "aws_cloudwatch_log_group" "api_gateway_access_logs" {
#   name              = "${var.api_log_prefix}-${var.environment}-api-access-logs"
#   retention_in_days = var.retention_days

#   tags = {
#     Environment = var.environment
#     Name        = "${var.environment}-api-access-logs"
#   }
# }

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

