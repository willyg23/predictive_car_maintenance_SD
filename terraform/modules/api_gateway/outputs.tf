output "api_gateway_url" {
  description = "URL of the HTTP API Gateway deployment"
  value       = "${aws_apigatewayv2_api.main.api_endpoint}/api"
}

output "api_id" {
  description = "ID of the HTTP API Gateway"
  value       = aws_apigatewayv2_api.main.id
}

output "stage_id" {
  description = "ID of the HTTP API Gateway stage"
  value       = aws_apigatewayv2_stage.main.id
}

output "api_gateway_stage_name" {
  description = "The name of the API Gateway stage"
  value       = aws_apigatewayv2_stage.main.name
}

output "api_gateway_invoke_url" {
  description = "The URL to invoke the API Gateway"
  value       = aws_apigatewayv2_stage.main.invoke_url
}
