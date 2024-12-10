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
