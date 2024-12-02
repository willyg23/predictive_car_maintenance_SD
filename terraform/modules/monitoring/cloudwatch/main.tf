resource "aws_cloudwatch_log_group" "rds_postgresql_log_group" {
  name              = "${var.log_group_prefix}-${var.environment}-postgresql-logs"
  retention_in_days = var.retention_days

  tags = {
    Environment = var.environment
    Name        = "${var.environment}-postgresql-logs"
  }
}

resource "aws_cloudwatch_log_group" "rds_upgrade_log_group" {
  name              = "${var.log_group_prefix}-${var.environment}-upgrade-logs"
  retention_in_days = var.retention_days

  tags = {
    Environment = var.environment
    Name        = "${var.environment}-upgrade-logs"
  }
}