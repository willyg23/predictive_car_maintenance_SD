module "test_bucket" {
  source = "../../modules/storage/s3/test_bucket"
  environment = "dev"
}
