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

output "ec2_log_group_name" {
  description = "Name of the EC2 CloudWatch log group"
  value       = aws_cloudwatch_log_group.ec2_instance_logs.name
}

output "ec2_log_group_arn" {
  description = "ARN of the EC2 CloudWatch log group"
  value       = aws_cloudwatch_log_group.ec2_instance_logs.arn
}

output "ecs_log_group_name" {
  description = "Name of the ECS CloudWatch log group"
  value       = aws_cloudwatch_log_group.ecs_container_logs.name
}

output "ecs_log_group_arn" {
  description = "ARN of the ECS CloudWatch log group"
  value       = aws_cloudwatch_log_group.ecs_container_logs.arn
}

output "auto_scaling_log_group_name" {
  description = "Name of the Auto Scaling Group CloudWatch log group"
  value       = aws_cloudwatch_log_group.auto_scaling_group_logs.name
}

output "auto_scaling_log_group_arn" {
  description = "ARN of the Auto Scaling Group CloudWatch log group"
  value       = aws_cloudwatch_log_group.auto_scaling_group_logs.arn
}

