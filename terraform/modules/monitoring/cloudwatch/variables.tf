variable "environment" {
  description = "Environment (like prod, dev, or sandbox)"
  type        = string
}

variable "retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 30
}

variable "log_group_prefix" {
  description = "Prefix for CloudWatch log group names"
  type        = string
  default     = "/aws/rds"
}