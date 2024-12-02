output "postgresql_log_group_name" {
  description = "Name of the PostgreSQL CloudWatch log group"
  value       = aws_cloudwatch_log_group.rds_postgresql_log_group.name
}

output "postgresql_log_group_arn" {
  description = "ARN of the PostgreSQL CloudWatch log group"
  value       = aws_cloudwatch_log_group.rds_postgresql_log_group.arn
}

output "upgrade_log_group_name" {
  description = "Name of the upgrade CloudWatch log group"
  value       = aws_cloudwatch_log_group.rds_upgrade_log_group.name
}

output "upgrade_log_group_arn" {
  description = "ARN of the upgrade CloudWatch log group"
  value       = aws_cloudwatch_log_group.rds_upgrade_log_group.arn
}
