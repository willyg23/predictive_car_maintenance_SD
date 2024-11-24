#syntax notes:
#terraform_state == a reference name (aka local name) for this s3 bucket within our terraform code
#different resource types can have the same reference name
#the actual name of the s3 bucket, (i.e. that you'd see in the aws management console) is "senior-design-terraform-state"
resource "aws_s3_bucket" "terraform_state" {
  bucket = "senior-design-terraform-state"
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  #referencing resources by their id is standard practice
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket                  = aws_s3_bucket.terraform_state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "terraform_state_lock" {
  name         = "senior-design-terraform-state-lock"
  billing_mode = "PAY_PER_REQUEST"
  /*
    creates a column called LockID in the table
    which is used by terraform to:
    write a lock entry when someone runs terraform apply
    check if someone else is already running terraform
    remove the lock if they're done
    */
  hash_key = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }
}