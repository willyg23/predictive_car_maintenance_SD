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

output "invoke_arn" {
  description = "The invoke ARN of the Lambda function"
  value       = aws_lambda_function.api_lambda.invoke_arn
}