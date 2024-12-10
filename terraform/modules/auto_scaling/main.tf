# Launch Template
resource "aws_launch_template" "app_launch_template" {
  name_prefix   = "${var.environment}-launch-template"
  image_id      = "ami-0866a04d72a1f5479" # Latest Amazon Linux 2023 AMI for us-east-2
  instance_type = "t3.micro"

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [var.ec2_security_group_id]
  }

  # yes i hardcoded the api key. no i don't give a fuck. not right now at least. will figure out a better way to do it later. but we're on a crunch rn.
  user_data = base64encode(<<-EOF
              #!/bin/bash
              git
              # Set environment variables
              echo "OPENAI_API_KEY=placeholder" >> /etc/environment
              
              # Source the environment file
              source /etc/environment
              
              # Rest of your existing user data script
              yum update -y
              yum install -y docker
              systemctl start docker
              systemctl enable docker
              
              aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin ${var.ecr_repository_url}
              docker pull ${var.ecr_repository_url}:latest
              docker run -d --restart always -p 80:80 ${var.ecr_repository_url}:latest
              EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "${var.environment}-app-instance"
      Environment = var.environment
    }
  }

  iam_instance_profile {
    name = var.instance_profile_name
  }
}


# Auto Scaling Group
resource "aws_autoscaling_group" "app_asg" {
  name = "${var.environment}-app-asg"
  desired_capacity          = var.desired_capacity
  max_size                  = var.max_size
  min_size                  = var.min_size
  # use commneted out variables to take down all active instnaces
  # desired_capacity          = 0
  # max_size                  = 2
  # min_size                  = 0
  target_group_arns         = [var.target_group_arn]
  vpc_zone_identifier       = var.public_subnet_ids
  health_check_type         = "ELB"
  health_check_grace_period = var.health_check_grace_period
  protect_from_scale_in     = false # turn to false when you want to take down all active instances
  termination_policies      = ["OldestInstance", "Default"]

  launch_template {
    id      = aws_launch_template.app_launch_template.id
    version = "$Latest"
  }

  instance_refresh {
    strategy = "Rolling"
    preferences {
      min_healthy_percentage = 50
      instance_warmup        = 300
    }
  }

  lifecycle {
    create_before_destroy = true
  }

  tag {
    key                 = "Name"
    value               = "${var.environment}-app-instance"
    propagate_at_launch = true
  }
}

# Target Group Attachment
resource "aws_autoscaling_attachment" "asg_attachment" {
  autoscaling_group_name = aws_autoscaling_group.app_asg.name
  lb_target_group_arn    = var.target_group_arn
}

# CPU Utilization Scale Out Policy
resource "aws_autoscaling_policy" "cpu_scale_out" {
  name                      = "${var.environment}-cpu-scale-out"
  autoscaling_group_name    = aws_autoscaling_group.app_asg.name
  policy_type               = "StepScaling"
  adjustment_type           = "ChangeInCapacity"
  estimated_instance_warmup = var.cooldown_period

  step_adjustment {
    scaling_adjustment          = 1
    metric_interval_lower_bound = 0
    metric_interval_upper_bound = 20
  }

  step_adjustment {
    scaling_adjustment          = 2
    metric_interval_lower_bound = 20
  }
}

# CPU Utilization Scale In Policy
resource "aws_autoscaling_policy" "cpu_scale_in" {
  name                   = "${var.environment}-cpu-scale-in"
  autoscaling_group_name = aws_autoscaling_group.app_asg.name
  policy_type            = "SimpleScaling"
  adjustment_type        = "ChangeInCapacity"
  cooldown               = var.cooldown_period
  scaling_adjustment     = -1
}

# Memory Utilization Alarms and Policies
resource "aws_cloudwatch_metric_alarm" "memory_high" {
  alarm_name          = "${var.environment}-memory-utilization-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/EC2"
  period              = "300"
  statistic           = "Average"
  threshold           = var.memory_utilization_high
  alarm_description   = "Scale out if memory utilization is above threshold"
  alarm_actions       = [aws_autoscaling_policy.memory_scale_out.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.app_asg.name
  }
}

resource "aws_autoscaling_policy" "memory_scale_out" {
  name                   = "${var.environment}-memory-scale-out"
  autoscaling_group_name = aws_autoscaling_group.app_asg.name
  policy_type            = "SimpleScaling"
  adjustment_type        = "ChangeInCapacity"
  cooldown               = var.cooldown_period
  scaling_adjustment     = 1
}

# Request Count Alarms and Policies
resource "aws_cloudwatch_metric_alarm" "request_count_high" {
  alarm_name          = "${var.environment}-request-count-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "RequestCount"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Sum"
  threshold           = 1000
  alarm_description   = "Scale out if request count is above threshold"
  alarm_actions       = [aws_autoscaling_policy.request_scale_out.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.app_asg.name
  }
}

resource "aws_autoscaling_policy" "request_scale_out" {
  name                   = "${var.environment}-request-scale-out"
  autoscaling_group_name = aws_autoscaling_group.app_asg.name
  policy_type            = "SimpleScaling"
  adjustment_type        = "ChangeInCapacity"
  cooldown               = var.cooldown_period
  scaling_adjustment     = 1
}

# Connection Count Alarms and Policies
resource "aws_cloudwatch_metric_alarm" "connection_count_high" {
  alarm_name          = "${var.environment}-connection-count-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ActiveConnectionCount"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Average"
  threshold           = 500
  alarm_description   = "Scale out if connection count is above threshold"
  alarm_actions       = [aws_autoscaling_policy.connection_scale_out.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.app_asg.name
  }
}

resource "aws_autoscaling_policy" "connection_scale_out" {
  name                   = "${var.environment}-connection-scale-out"
  autoscaling_group_name = aws_autoscaling_group.app_asg.name
  policy_type            = "SimpleScaling"
  adjustment_type        = "ChangeInCapacity"
  cooldown               = var.cooldown_period
  scaling_adjustment     = 1
}

# CloudWatch Alarms for CPU
resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "${var.environment}-cpu-utilization-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "300"
  statistic           = "Average"
  threshold           = var.cpu_utilization_high
  alarm_description   = "Scale out if CPU utilization is above threshold"
  alarm_actions       = [aws_autoscaling_policy.cpu_scale_out.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.app_asg.name
  }
}

resource "aws_cloudwatch_metric_alarm" "cpu_low" {
  alarm_name          = "${var.environment}-cpu-utilization-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "300"
  statistic           = "Average"
  threshold           = var.cpu_utilization_low
  alarm_description   = "Scale in if CPU utilization is below threshold"
  alarm_actions       = [aws_autoscaling_policy.cpu_scale_in.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.app_asg.name
  }
}
