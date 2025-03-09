output "rds_security_group_id" {
  description = "ID of the RDS security group"
  value       = aws_security_group.rds_security_group.id
}

output "api_lambda_security_group_id" {
  description = "ID of the lambda security group"
  value       = aws_security_group.api_lambda_security_group.id
}