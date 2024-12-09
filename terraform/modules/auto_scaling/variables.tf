variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "target_group_arn" {
  description = "ARN of the ALB target group"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs for EC2 instances"
  type        = list(string)
}

variable "ecs_security_group_id" {
  description = "Security group ID for ECS instances"
  type        = string
}

variable "ec2_security_group_id" {
  description = "Security group ID for EC2 instances"
  type        = string
}

# Auto Scaling Configuration
variable "min_size" {
  description = "Minimum number of instances per AZ"
  type        = number
  default     = 1
}

variable "max_size" {
  description = "Maximum number of instances per AZ"
  type        = number
  default     = 3
}

variable "desired_capacity" {
  description = "Desired number of instances per AZ"
  type        = number
  default     = 1
}

variable "health_check_grace_period" {
  description = "Time after instance comes into service before checking health"
  type        = number
  default     = 300
}

variable "cooldown_period" {
  description = "Time between scaling activities (seconds)"
  type        = number
  default     = 300
}

# Scaling Thresholds
variable "cpu_utilization_high" {
  description = "CPU utilization threshold for scaling out"
  type        = number
  default     = 70
}

variable "cpu_utilization_low" {
  description = "CPU utilization threshold for scaling in"
  type        = number
  default     = 30
}

variable "memory_utilization_high" {
  description = "Memory utilization threshold for scaling out"
  type        = number
  default     = 80
}

variable "memory_utilization_low" {
  description = "Memory utilization threshold for scaling in"
  type        = number
  default     = 40
}

variable "ecr_repository_url" {
  description = "URL of the ECR repository containing the application image"
  type        = string
}

variable "instance_profile_name" {
  description = "Name of the EC2 instance profile"
  type        = string
}
