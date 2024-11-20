# this file tells terraform where to store the tfstate file
# the tfstate file is created by terraform itself when you run terraform apply
terraform {
  backend "s3" {
    # need to use bucket name here, not bucket id, because this file is getting the terraform state. the file can't look up resource IDs before it has the terraform state. chikcke and egg.
    bucket = "senior-design-terraform-state"
    /* 
    this object will be written to the "senior-design-terraform-state" s3 bucket
    terraform will create the object with this key path when it saves state. the full path will be: s3://senior-design-terraform-state/dev/terraform.tfstate
    but we don't need to repeat senior-design-terraform-state in the key, since that's already part of the bucket name.
    */
    key            = "dev/terraform.tfstate"
    region         = "us-east-2"
    dynamodb_table = "senior-design-terraform-state-lock"
  }
}