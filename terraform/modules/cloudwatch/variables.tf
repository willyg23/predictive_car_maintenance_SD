variable "environment" {
  description = "Environment (like prod, dev, or sandbox)"
  type        = string
}

variable "retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 7
}

variable "rds_log_group_prefix" {
  description = "Prefix for CloudWatch log group names"
  type        = string
  default     = "/aws/rds"
}

variable "ec2_log_group_prefix" {
  description = "Prefix for EC2 related CloudWatch log groups"
  type        = string
  default     = "/aws/ec2"
}

variable "vpc_log_prefix" {
  description = "Prefix for VPC Flow Logs CloudWatch log groups"
  type        = string
  default     = "/aws/vpc"
}

variable "api_log_prefix" {
  description = "Prefix for API Gateway log groups"
  type        = string
  default     = "/aws/api"
}