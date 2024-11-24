/*
this file gives developers permission to use s3 and dynamoDB that maintain the tfstate file

in simple terms:
Our AWS infrastructure (VPC, EC2, RDS) is like a building
•	The terraform state file in S3 is like the building’s blueprint
•	The DynamoDB lock is like a “Do Not Disturb” sign
•	This policy gives developers permission to:
    •	Look at and update the blueprint (S3 permissions)
    •	Put up and remove the “Do Not Disturb” sign (DynamoDB permissions)
*/

# IAM Policy
resource "aws_iam_policy" "terraform_state_policy" {
  name = "terraform-state-management"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "arn:aws:s3:::senior-design-terraform-state",
          "arn:aws:s3:::senior-design-terraform-state/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem"
        ]
        Resource = "arn:aws:dynamodb:*:*:table/senior-design-terraform-state-lock"
      }
    ]
  })
}

# IAM Role
resource "aws_iam_role" "terraform_state_role" {
  name = "terraform-state-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = [
            # here is where you add developers to have access to this role
            "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/willyg"
          ]
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# Attach policy to role
resource "aws_iam_role_policy_attachment" "terraform_state_policy_attach" {
  role       = aws_iam_role.terraform_state_role.name
  policy_arn = aws_iam_policy.terraform_state_policy.arn
}
