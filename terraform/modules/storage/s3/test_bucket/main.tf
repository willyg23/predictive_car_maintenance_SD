resource "aws_s3_bucket" "test" {
  bucket = "senior-design-test-bucket-${var.environment}"

  tags = {
    Environment = var.environment
    Test        = "state-management" # Add a new tag for testing purposes
    Test2       = "test2"            # testing again
    Test3       = "test3"
    Test4       = "test4"
  }
}
