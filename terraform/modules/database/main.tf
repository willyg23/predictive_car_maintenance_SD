module "networking" {
  source      = "../networking"
  environment = var.environment
}

resource "aws_db_instance" "database" {
  allocated_storage    = var.db_allocated_storage
  db_name              = "${var.environment}-db"
  engine               = var.db_engine
  engine_version       = var.db_engine_version
  instance_class       = var.db_instance_class
  username             = var.db_username
  password             = var.DB_PASSWORD
  parameter_group_name = var.db_parameter_group_name
  skip_final_snapshot  = true

  db_subnet_group_name   = module.networking.rds_subnet_group_name
  vpc_security_group_ids = [module.networking.rds_security_group_id]
}
