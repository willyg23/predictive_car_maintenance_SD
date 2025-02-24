### same variables as the networking folder - start

variable "vpc_cidr" {
  description = "cidr IP range for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "environment" {
  description = "Environment (like prod, dev, or sandbox)"
  type        = string
}

variable "azs" {
  description = "Availability zones for subnets"
  type        = list(string)
  default     = ["us-east-2a", "us-east-2b"]
}

variable "public_subnet_cidrs" {
  description = "public subnet cidrs for the vpc"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "private subnet cidrs for the vpc"
  type        = list(string)
  default     = ["10.0.3.0/24", "10.0.4.0/24"]
}


### same variables as the networking folder - end

variable "vpc_main_id" {
  description = "ID of the VPC where security groups will be created"
  type        = string
}

variable "db_port" {
  description = "Port for PostgreSQL database connections"
  type        = number
  default     = 5432
}

variable "http_port" {
  description = "Port for HTTP traffic"
  type        = number
  default     = 80
}

variable "https_port" {
  description = "Port for HTTPS traffic"
  type        = number
  default     = 443
}

variable "dev_port" {
  description = "Port for React Native development server"
  type        = number
  default     = 3000
}