output "lambda_function_arn" {
  description = "The ARN of the Lambda function"
  value       = aws_lambda_function.api_lambda.arn
}

output "lambda_function_name" {
  description = "The name of the Lambda function"
  value       = aws_lambda_function.api_lambda.function_name
}

output "lambda_image_uri" {
  description = "The full image URI for the Lambda function package"
  value       = aws_lambda_function.api_lambda.image_uri
}

output "lambda_execution_role_arn" {
  description = "The ARN of the Lambda execution role"
  value       = aws_iam_role.lambda_execution_role.arn
}

output "lambda_execution_role_name" {
  description = "The name of the Lambda execution role"
  value       = aws_iam_role.lambda_execution_role.name
}