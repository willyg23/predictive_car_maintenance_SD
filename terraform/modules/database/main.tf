resource "aws_db_instance" "database" {
  allocated_storage      = var.db_allocated_storage
  db_name                = "${var.environment}_db"
  engine                 = var.db_engine
  engine_version         = var.db_engine_version
  instance_class         = var.db_instance_class
  username               = var.DB_USERNAME
  password               = var.DB_PASSWORD
  parameter_group_name   = var.db_parameter_group_name
  skip_final_snapshot    = true
  db_subnet_group_name   = var.rds_subnet_group_name
  vpc_security_group_ids = [var.rds_security_group_id]

  tags = {
    Name        = "${var.environment}-rds-instance"
    Environment = var.environment
  }
}
