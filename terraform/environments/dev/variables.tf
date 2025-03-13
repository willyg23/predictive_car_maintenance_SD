# for env variables, like the db password
variable "DB_PASSWORD" {
  description = "rds password"
  type        = string
  sensitive   = true
}

variable "DB_USERNAME" {
  description = "rds username"
  type        = string
  sensitive   = true
}

variable "ENVIRONMENT" {
  description = "dev or prod. used in the lambda, so that backend routes can adapt to be for dev or prod"
  type        = string
}