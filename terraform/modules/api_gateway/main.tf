# HTTP API Gateway
resource "aws_apigatewayv2_api" "main" {
  name          = "${var.environment}-http-api"
  protocol_type = "HTTP"
}

# API Stage
resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = var.environment
  auto_deploy = true
}

# Integration with ALB
resource "aws_apigatewayv2_integration" "alb" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "HTTP_PROXY"

  integration_uri    = "http://${var.alb_dns_name}/generate-gpt-response"
  integration_method = "POST"
  connection_type    = "INTERNET"

  request_parameters = {
    "append:header.Content-Type" = "application/json"
  }

  timeout_milliseconds = 30000
}



# Route for POST method
resource "aws_apigatewayv2_route" "post" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /generate-gpt-response"
  target    = "integrations/${aws_apigatewayv2_integration.alb.id}"
}
