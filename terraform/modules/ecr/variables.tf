variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "repository_name" {
  description = "Name of the ECR repository"
  type        = string
}

variable "image_tag_mutability" {
  description = "The tag mutability setting for the repository (MUTABLE or IMMUTABLE)"
  type        = string
  default     = "IMMUTABLE"
}

variable "scan_on_push" {
  description = "Indicates whether images are scanned after being pushed to the repository"
  type        = bool
  default     = true
}

#included so it's easier to delete in dev, if need be. set to false when using in prod.
variable "force_delete" {
  description = "If true, will delete the repository even if it contains images"
  type        = bool
  default     = true
}