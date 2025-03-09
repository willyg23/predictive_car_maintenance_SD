output "db_instance_endpoint" {
  description = "The endpoint address of the RDS database instance."
  value       = aws_db_instance.database.endpoint
}

output "db_instance_port" {
  description = "The port on which the RDS database instance is listening."
  value       = aws_db_instance.database.port
}

output "db_instance_identifier" {
  description = "The identifier of the RDS database instance."
  value       = aws_db_instance.database.id
}

output "db_instance_arn" {
  description = "The ARN of the RDS database instance."
  value       = aws_db_instance.database.arn
}