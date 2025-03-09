# Lambda Security Group
resource "aws_security_group" "api_lambda_security_group" {
  name_prefix = "${var.environment}-lambda-to-db-security-group-"
  # use name_prefix instead of name. because name_prefix allows terraform to create a unique name for each security group. 
  vpc_id = var.vpc_main_id

  tags = {
    Name        = "${var.environment}-lambda-to-db-security-group"
    Environment = var.environment
  }
}

# Outbound rule: Allow Lambda to connect to RDS on PostgreSQL port
resource "aws_vpc_security_group_egress_rule" "lambda_to_rds" {
  security_group_id            = aws_security_group.api_lambda_security_group.id
  from_port                    = var.db_port
  to_port                      = var.db_port
  ip_protocol                  = "tcp"
  description                  = "Allow outbound traffic from Lambda to RDS"
  referenced_security_group_id = aws_security_group.rds_security_group.id
}

# RDS Security Group
resource "aws_security_group" "rds_security_group" {
  name_prefix = "${var.environment}-rds-security-group-"
  description = "Security group for RDS instances"
  vpc_id      = var.vpc_main_id

  tags = {
    Name        = "${var.environment}-rds-security-group"
    Environment = var.environment
  }
}

# Inbound rule: Allow RDS to accept traffic from Lambda on PostgreSQL port
resource "aws_vpc_security_group_ingress_rule" "rds_from_lambda" {
  security_group_id            = aws_security_group.rds_security_group.id
  from_port                    = var.db_port
  to_port                      = var.db_port
  ip_protocol                  = "tcp"
  description                  = "Allow inbound PostgreSQL traffic from Lambda"
  referenced_security_group_id = aws_security_group.api_lambda_security_group.id
}
