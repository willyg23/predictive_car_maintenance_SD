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

  default_route_settings {
    detailed_metrics_enabled = true
    logging_level            = "INFO"
    # ^ logging_level is important as it shows execution logging, the internal processing steps, of the API gateway. which makes it easier to debug compplicated stuff.
    # Can be "OFF", "ERROR", or "INFO"
    # OFF == disables execution logging
    # ERROR == only logs errors
    # INFO == logs all events
    # you should have it as INFO, there's basically no reason to not log all events

    # NOT optional throttling settings. if you don't set these, they default to 0, and thus no one can ever (including you and your own team) make a call to your api :(
    throttling_burst_limit = 200
    throttling_rate_limit  = 100
  }

  access_log_settings {
    destination_arn = var.cloudwatch_log_group_arn
    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
    })
  }
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.lambda_invoke_arn
  integration_method     = "POST" # always POST for Lambda proxy integrations
  payload_format_version = "1.0"  # use 1.0 for the aws-wsgi library
}

resource "aws_lambda_permission" "api_gateway_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*"
}

# route for health check
resource "aws_apigatewayv2_route" "health_check" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /health"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# route for creating db schema
resource "aws_apigatewayv2_route" "create_db_schema" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /create_db_schema"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# Route for getting all cars for a user
resource "aws_apigatewayv2_route" "get_user_cars" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /user/{user_uuid}/cars"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# Route for creating a fake user
resource "aws_apigatewayv2_route" "create_fake_user" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /create_fake_user"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# Route for deleting a car for a user
resource "aws_apigatewayv2_route" "delete_user_car" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "DELETE /user/{user_uuid}/car/{car_id}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# Route for updating car details
resource "aws_apigatewayv2_route" "update_car_details" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "PUT /user/{user_uuid}/car/{car_id}/details"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# Route for a user adding a new car
resource "aws_apigatewayv2_route" "add_user_car" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /user/{user_uuid}/car/add_user_car" 
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}