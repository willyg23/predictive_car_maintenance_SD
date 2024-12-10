### EC2
# Base security group for EC2
resource "aws_security_group" "ec2_security_group" {
  name        = "${var.environment}-ec2-security-group"
  description = "Security group for EC2 instances"
  vpc_id      = var.vpc_main_id

  tags = {
    Name        = "${var.environment}-ec2-security-group"
    Environment = var.environment
  }
}

# Inbound HTTP from ALB
resource "aws_vpc_security_group_ingress_rule" "ec2_ingress_alb_http" {
  security_group_id            = aws_security_group.ec2_security_group.id
  from_port                    = var.http_port
  to_port                      = var.http_port
  ip_protocol                  = "tcp"
  description                  = "Allow HTTP traffic from ALB"
  referenced_security_group_id = aws_security_group.alb_security_group.id
}

# Inbound HTTPS from ALB
resource "aws_vpc_security_group_ingress_rule" "ec2_ingress_alb_https" {
  security_group_id            = aws_security_group.ec2_security_group.id
  from_port                    = var.https_port
  to_port                      = var.https_port
  ip_protocol                  = "tcp"
  description                  = "Allow HTTPS traffic from ALB"
  referenced_security_group_id = aws_security_group.alb_security_group.id
}

# added to i can ssh into instance from my machine
resource "aws_vpc_security_group_ingress_rule" "ec2_ingress_ssh" {
  security_group_id = aws_security_group.ec2_security_group.id
  from_port         = 22
  to_port           = 22
  ip_protocol       = "tcp"
  description       = "Allow SSH access"
  cidr_ipv4         = "0.0.0.0/0" # Or your IP for better security
}

# Inbound PostgreSQL
resource "aws_vpc_security_group_ingress_rule" "ec2_ingress_db" {
  security_group_id = aws_security_group.ec2_security_group.id
  from_port         = var.db_port
  to_port           = var.db_port
  ip_protocol       = "tcp"
  description       = "Allow PostgreSQL traffic"
  cidr_ipv4         = var.vpc_cidr
}

# Outbound HTTPS for container pulls
resource "aws_vpc_security_group_egress_rule" "ec2_egress_https" {
  security_group_id = aws_security_group.ec2_security_group.id
  from_port         = var.https_port
  to_port           = var.https_port
  ip_protocol       = "tcp"
  description       = "Allow HTTPS for container pulls and updates"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "ec2_egress_http" {
  security_group_id = aws_security_group.ec2_security_group.id
  from_port         = var.http_port
  to_port           = var.http_port
  ip_protocol       = "tcp"
  description       = "Allow HTTP outbound traffic"
  cidr_ipv4         = "0.0.0.0/0"
}

# Outbound PostgreSQL
resource "aws_vpc_security_group_egress_rule" "ec2_egress_db" {
  security_group_id = aws_security_group.ec2_security_group.id
  from_port         = var.db_port
  to_port           = var.db_port
  ip_protocol       = "tcp"
  description       = "Allow PostgreSQL outbound traffic"
  cidr_ipv4         = var.vpc_cidr
}


### ECS - not using rn but will keep for now. might delete later if still not using.
# Base security group
resource "aws_security_group" "ecs_security_group" {
  name        = "${var.environment}-ecs-security-group"
  description = "Security group for ECS. allow inbound traffic from ALB and the RDS DB. allow outbound traffic from HTTPS (var.https_port) (for container pulls and updates) and var.db_port for accessing the RDS DB."
  vpc_id      = var.vpc_main_id

  tags = {
    Name        = "${var.environment}-ecs-security-group"
    Environment = var.environment
  }
}

# Inbound HTTP from ALB
resource "aws_vpc_security_group_ingress_rule" "ecs_ingress_alb_http" {
  security_group_id            = aws_security_group.ecs_security_group.id
  from_port                    = var.http_port
  to_port                      = var.http_port
  ip_protocol                  = "tcp"
  description                  = "Allow HTTP traffic from ALB"
  referenced_security_group_id = aws_security_group.alb_security_group.id
}

# Inbound HTTPS from ALB
resource "aws_vpc_security_group_ingress_rule" "ecs_ingress_alb_https" {
  security_group_id            = aws_security_group.ecs_security_group.id
  from_port                    = var.https_port
  to_port                      = var.https_port
  ip_protocol                  = "tcp"
  description                  = "Allow HTTPS traffic from ALB"
  referenced_security_group_id = aws_security_group.alb_security_group.id
}

# Inbound PostgreSQL
resource "aws_vpc_security_group_ingress_rule" "ecs_ingress_db" {
  security_group_id = aws_security_group.ecs_security_group.id
  from_port         = var.db_port
  to_port           = var.db_port
  ip_protocol       = "tcp"
  description       = "Allow PostgreSQL traffic"
  cidr_ipv4         = var.vpc_cidr
}

# Outbound HTTPS for container pulls
resource "aws_vpc_security_group_egress_rule" "ecs_egress_https" {
  security_group_id = aws_security_group.ecs_security_group.id
  from_port         = var.https_port
  to_port           = var.https_port
  ip_protocol       = "tcp"
  description       = "Allow HTTPS for container pulls and updates"
  cidr_ipv4         = "0.0.0.0/0"
}

# Outbound PostgreSQL
resource "aws_vpc_security_group_egress_rule" "ecs_egress_db" {
  security_group_id = aws_security_group.ecs_security_group.id
  from_port         = var.db_port
  to_port           = var.db_port
  ip_protocol       = "tcp"
  description       = "Allow PostgreSQL outbound traffic"
  cidr_ipv4         = var.vpc_cidr
}

# Inbound local development 
resource "aws_vpc_security_group_ingress_rule" "ecs_ingress_dev" {
  security_group_id = aws_security_group.ecs_security_group.id
  from_port         = var.dev_port
  to_port           = var.dev_port
  ip_protocol       = "tcp"
  description       = "Allow React Native development server access"
  cidr_ipv4         = var.vpc_cidr
}

# Outbound local development 
resource "aws_vpc_security_group_egress_rule" "ecs_egress_dev" {
  security_group_id = aws_security_group.ecs_security_group.id
  from_port         = var.dev_port
  to_port           = var.dev_port
  ip_protocol       = "tcp"
  description       = "Allow React Native development server outbound access"
  cidr_ipv4         = var.vpc_cidr
}

# ALB

# Base security group for ALB
resource "aws_security_group" "alb_security_group" {
  name        = "${var.environment}-alb-security-group"
  description = "Security group for Application Load Balancer. Allows inbound HTTP and HTTPS from anywhere. Allows outbound only to our ECS instances"
  vpc_id      = var.vpc_main_id

  tags = {
    Name        = "${var.environment}-alb-security-group"
    Environment = var.environment
  }
}

# Inbound HTTP from anywhere
resource "aws_vpc_security_group_ingress_rule" "alb_ingress_http" {
  security_group_id = aws_security_group.alb_security_group.id
  from_port         = var.http_port
  to_port           = var.http_port
  ip_protocol       = "tcp"
  description       = "Allow HTTP from anywhere"
  cidr_ipv4         = "0.0.0.0/0"
}

# Inbound HTTPS from anywhere
resource "aws_vpc_security_group_ingress_rule" "alb_ingress_https" {
  security_group_id = aws_security_group.alb_security_group.id
  from_port         = var.https_port
  to_port           = var.https_port
  ip_protocol       = "tcp"
  description       = "Allow HTTPS from anywhere"
  cidr_ipv4         = "0.0.0.0/0"
}

# Outbound to EC2 instances
resource "aws_vpc_security_group_egress_rule" "alb_egress_ec2" {
  security_group_id            = aws_security_group.alb_security_group.id
  from_port                    = var.http_port
  to_port                      = var.http_port
  ip_protocol                  = "tcp"
  description                  = "Allow traffic to EC2 instances"
  referenced_security_group_id = aws_security_group.ec2_security_group.id
}




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