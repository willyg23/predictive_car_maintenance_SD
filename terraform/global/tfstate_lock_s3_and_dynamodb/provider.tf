/*
purpose of provider.tf files
the provider.tf file tells Terraform:
	•	Which cloud provider to use (AWS in your case)
	•	Which region to deploy resources in
	•	Any global provider settings
*/
provider "aws" {
  region = "us-east-2"
}