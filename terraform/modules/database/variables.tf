variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "DB_PASSWORD" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "DB_USERNAME" {
  description = "The username for the RDS database instance."
  type        = string
  sensitive   = true
}

variable "db_allocated_storage" {
  description = "The allocated storage (in GB) for the database instance."
  type        = number
  default     = 20
}

variable "db_instance_class" {
  description = "The instance class for the RDS database instance."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_engine" {
  description = "The database engine to use."
  type        = string
  default     = "postgres"
}

variable "db_engine_version" {
  description = "The version of the database engine."
  type        = string
  default     = "16.4"
}

variable "db_parameter_group_name" {
  description = "The parameter group name for the RDS database instance."
  type        = string
  default     = "default.postgres16"
}

variable "rds_subnet_group_name" {
  description = "Name of the RDS subnet group"
  type        = string
}

variable "rds_security_group_id" {
  description = "ID of the RDS security group"
  type        = string
}
