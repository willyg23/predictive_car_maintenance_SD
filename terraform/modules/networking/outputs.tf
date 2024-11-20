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