resource "aws_ecr_repository" "app_repository" {
  name = "${var.environment}-${var.repository_name}"

  image_scanning_configuration {
    scan_on_push = true
  }

  # Enable tag immutability to prevent overwriting tags
  image_tag_mutability = "IMMUTABLE"

  # Force delete repository and images when destroying
  force_delete = true

  tags = {
    Environment = var.environment
    Name        = "${var.environment}-${var.repository_name}"
    Managed_by  = "terraform"
  }
}
