variable "vpc_cidr" {
  description = "cidr IP range for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "environment" {
  description = "Environment (like prod, dev, or sandbox)"
  type        = string
  # this does not have a default, as we specify the environment variable when we create the resource in the main.tf of the dev or prod folder
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