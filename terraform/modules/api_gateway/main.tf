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

# Route for POST method
resource "aws_apigatewayv2_route" "post" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /generate-gpt-response"
  target    = "integrations/${aws_apigatewayv2_integration.alb.id}"
}
