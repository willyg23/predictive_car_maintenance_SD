output "asg_name" {
  description = "Name of the Auto Scaling Group"
  value       = aws_autoscaling_group.app_asg.name
}

output "asg_arn" {
  description = "ARN of the Auto Scaling Group"
  value       = aws_autoscaling_group.app_asg.arn
}

output "asg_min_size" {
  description = "Minimum size of the Auto Scaling Group"
  value       = aws_autoscaling_group.app_asg.min_size
}

output "asg_max_size" {
  description = "Maximum size of the Auto Scaling Group"
  value       = aws_autoscaling_group.app_asg.max_size
}

output "asg_desired_capacity" {
  description = "Desired capacity of the Auto Scaling Group"
  value       = aws_autoscaling_group.app_asg.desired_capacity
}

output "asg_health_check_grace_period" {
  description = "Health check grace period of the Auto Scaling Group"
  value       = aws_autoscaling_group.app_asg.health_check_grace_period
}
