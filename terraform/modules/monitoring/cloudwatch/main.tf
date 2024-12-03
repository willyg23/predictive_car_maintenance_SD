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