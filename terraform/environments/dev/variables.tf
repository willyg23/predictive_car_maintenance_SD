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