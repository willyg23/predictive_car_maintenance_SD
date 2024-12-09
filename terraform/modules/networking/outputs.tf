output "vpc_main_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.vpc_main.id
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = aws_subnet.public_subnets[*].id
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = aws_subnet.private_subnets[*].id
}

output "internet_gateway_main_id" {
  description = "ID of the Internet Gateway"
  value       = aws_internet_gateway.internet_gateway_main.id
}

output "vpc_cidr_block" {
  description = "The CIDR block of the VPC"
  value       = aws_vpc.vpc_main.cidr_block
}

output "public_route_table_id" {
  description = "ID of public route table"
  value       = aws_route_table.public_route_table.id
}

output "private_route_table_id" {
  description = "ID of private route table"
  value       = aws_route_table.private_route_table.id
}

output "azs" {
  description = "Availability zones used"
  value       = var.azs
}

output "public_subnet_cidrs" {
  description = "CIDR blocks of public subnets"
  value       = var.public_subnet_cidrs
}

output "private_subnet_cidrs" {
  description = "CIDR blocks of private subnets"
  value       = var.private_subnet_cidrs
}

output "alb_security_group_id" {
  description = "ALB security group id"
  value       = module.security_groups.alb_security_group_id
}

output "ecs_security_group_id" {
  description = "ECS security group id"
  value       = module.security_groups.ecs_security_group_id
}

output "ec2_security_group_id" {
  description = "ID of the EC2 security group"
  value       = module.security_groups.ec2_security_group_id
}

output "rds_security_group_id" {
  description = "RDS security group id"
  value       = module.security_groups.rds_security_group_id
}

output "rds_subnet_group_name" {
  description = "Name of the RDS subnet group"
  value       = aws_db_subnet_group.rds_subnet_group.name
}