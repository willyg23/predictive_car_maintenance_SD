# Lambda Security Group
resource "aws_security_group" "api_lambda_security_group" {
  name_prefix = "${var.environment}-api-lambda-security-group-"
  # use name_prefix instead of name. because name_prefix allows terraform to create a unique name for each security group. 
  vpc_id = var.vpc_main_id

  tags = {
    Name        = "${var.environment}-api-lambda-security-group"
    Environment = var.environment
  }
}

# Lambda security group rule to allow outbound connections to RDS
resource "aws_security_group_rule" "lambda_rule_allow_lambda_to_connect_to_db" {
  type                     = "egress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  description              = "Rule to allow connections to RDS database from any Lambda function this security group is attached to."
  security_group_id        = aws_security_group.api_lambda_security_group.id
  source_security_group_id = aws_security_group.rds_security_group.id # attaches the security group rule to the security group
}


# RDS Security Group
resource "aws_security_group" "rds_security_group" {
  name_prefix = "${var.environment}-rds-security-group-"
  description = "Security group for RDS instances!"
  vpc_id      = var.vpc_main_id

  tags = {
    Name        = "${var.environment}-rds-security-group"
    Environment = var.environment
  }
}

# RDS security group rule to allow inbound connections from any lambda that has the
# api_lambda_security_group attached to it. because api_lambda_security_group has the
# lambda_rule_allow_lambda_to_connect_to_db attached to it, and the db_rule_allow_in
# security group rule allows any lambda with the lambda_rule_allow_lambda_to_connect_to_db rule
# to interact with the database (well, any database db_rule_allow_in is attached to)
resource "aws_security_group_rule" "db_rule_allow_in" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  description              = "Rule to allow connections from Lambda function with sg-0925232af9ca41b6e attached."
  security_group_id        = aws_security_group.rds_security_group.id
  source_security_group_id = aws_security_group.api_lambda_security_group.id # attaches the security group rule to the security group
}