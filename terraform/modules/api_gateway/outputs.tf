output "api_gateway_url" {
  description = "URL of the API Gateway deployment"
  value       = "${aws_api_gateway_stage.main.invoke_url}/api"
}

output "rest_api_id" {
  description = "ID of the REST API Gateway"
  value       = aws_api_gateway_rest_api.main.id
}

output "vpc_link_id" {
  description = "ID of the VPC Link"
  value       = aws_api_gateway_vpc_link.main.id
}
