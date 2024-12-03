variable "environment" {
  description = "Environment (like prod, dev, or sandbox)"
  type        = string
}

variable "retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 30
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

variable "ecs_log_group_prefix" {
  description = "Prefix for ECS related CloudWatch log groups"
  type        = string
  default     = "/aws/ecs"
}

variable "auto_scaling_group_log_prefix" {
  description = "Prefix for Auto Scaling Group CloudWatch log groups"
  type        = string
  default     = "/aws/asg"
}

variable "load_balancer_log_prefix" {
  description = "Prefix for Load Balancer related CloudWatch log groups"
  type        = string
  default     = "/aws/lb"
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
