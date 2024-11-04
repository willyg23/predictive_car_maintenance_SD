# predictive_car_maintenance_SD
Predictive car maintenance utilizing OBD sensors and AI


### Cloud Stuff

##### Terraform Directories

terraform/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── tfstate_s3.tf     # S3 + DynamoDB backend config for dev
│   │   └── provider.tf       # AWS provider config for dev
│   └── prod/
│       ├── main.tf
│       ├── tfstate_s3.tf     # S3 + DynamoDB backend config for dev
│       └── provider.tf       # AWS provider config for dev
├── modules/
│   ├── networking/
│   │   ├── main.tf        # VPC, subnets, IGW, route tables
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── security/
│   │   ├── main.tf        # Security groups, NACLs
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── compute/
│   │   ├── main.tf        # EC2, Auto Scaling, ELB
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── database/
│   │   ├── main.tf        # RDS configuration
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── api/
│       ├── main.tf        # API Gateway configuration
│       ├── variables.tf
│       └── outputs.tf
├── global/
│   ├── iam/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── cloudwatch/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── s3-dynamodb/      
│       ├── main.tf       # Creates S3 bucket and DynamoDB table for state
│       ├── variables.tf
│       └── outputs.tf
└── variables/
    ├── dev.tfvars
    └── prod.tfvars
