# RDS
# Base security group for RDS
resource "aws_security_group" "rds_security_group" {
  name        = "${var.environment}-rds-security-group"
  description = "Security group for RDS instances"
  vpc_id      = var.vpc_main_id

  tags = {
    Name        = "${var.environment}-rds-security-group"
    Environment = var.environment
  }
}

# Inbound PostgreSQL from ECS
resource "aws_vpc_security_group_ingress_rule" "rds_ingress_postgres" {
  security_group_id            = aws_security_group.rds_security_group.id
  from_port                    = var.db_port
  to_port                      = var.db_port
  ip_protocol                  = "tcp"
  description                  = "Allow PostgreSQL from ECS instances"
  referenced_security_group_id = aws_security_group.ecs_security_group.id
}