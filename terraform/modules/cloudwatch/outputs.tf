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


output "vpc_flow_log_group_name" {
  description = "Name of the VPC Flow Logs CloudWatch log group"
  value       = aws_cloudwatch_log_group.vpc_flow_logs.name
}

output "vpc_flow_log_group_arn" {
  description = "ARN of the VPC Flow Logs CloudWatch log group"
  value       = aws_cloudwatch_log_group.vpc_flow_logs.arn
}

output "api_access_log_group_name" {
  description = "Name of the API Gateway access logs CloudWatch log group"
  value       = aws_cloudwatch_log_group.api_gateway_access_logs.name
}

output "api_access_log_group_arn" {
  description = "ARN of the API Gateway access logs CloudWatch log group"
  value       = aws_cloudwatch_log_group.api_gateway_access_logs.arn
}

output "api_execution_log_group_name" {
  description = "Name of the API Gateway execution logs CloudWatch log group"
  value       = aws_cloudwatch_log_group.api_gateway_execution_logs.name
}

output "api_execution_log_group_arn" {
  description = "ARN of the API Gateway execution logs CloudWatch log group"
  value       = aws_cloudwatch_log_group.api_gateway_execution_logs.arn
}