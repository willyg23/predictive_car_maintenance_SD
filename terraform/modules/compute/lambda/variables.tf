variable "environment" {
  description = "Deployment environment (e.g., dev, staging, prod)"
  type        = string
}

variable "repository_url" {
  description = "The URL of the ECR repository containing the Lambda Docker image"
  type        = string
}

variable "repository_arn" {
  description = "The ARN of the ECR repository"
  type        = string
}

variable "repository_name" {
  description = "The name of the ECR repository"
  type        = string
}

variable "repository_registry_id" {
  description = "The registry ID where the ECR repository was created"
  type        = string
}

variable "lambda_image_tag" {
  description = "The Docker image tag used by the Lambda function"
  type        = string
  default     = "api-lambda-latest"
}

variable "lambda_role_arn" {
  description = "The ARN of the IAM role that the Lambda function assumes"
  type        = string
}

variable "lambda_memory_size" {
  description = "The memory (in MB) allocated to the Lambda function"
  type        = number
  default     = 128
}

variable "lambda_timeout" {
  description = "The timeout (in seconds) for the Lambda function"
  type        = number
  default     = 180
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

variable "ENVIRONMENT" {
  description = "dev or prod. used in the lambda, so that backend routes can adapt to be for dev or prod"
  type        = string
}

variable "vpc_private_subnet_ids" {
  description = "List of VPC private subnet IDs for Lambda function"
  type        = list(string)
}

variable "api_lambda_security_group_id" {
  description = "api lambda security group"
  type        = string
}