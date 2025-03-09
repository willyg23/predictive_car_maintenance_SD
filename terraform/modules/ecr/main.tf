resource "aws_ecr_repository" "app_repository" {
  name = "${var.environment}-${var.repository_name}"

  image_scanning_configuration {
    scan_on_push = true
  }

  # Enable tag mutability so we can overwrite tags. i.e. the tag "api_lambda"
  image_tag_mutability = "MUTABLE"

  # Force delete repository and images when destroying
  force_delete = true

  tags = {
    Environment = var.environment
    Name        = "${var.environment}-${var.repository_name}"
    Managed_by  = "terraform"
  }
}
