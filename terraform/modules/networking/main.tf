resource "aws_vpc" "vpc_main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = {
    Name        = "${var.environment}-vpc"
    Environment = var.environment
  }
}

# element(list, index) function:
# Takes a list and an index, Returns the element at that index, Wraps around if the index is larger than the list length
# Example: element(["a", "b", "c"], 1) returns "b"

resource "aws_subnet" "public_subnets" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.vpc_main.id
  cidr_block              = element(var.public_subnet_cidrs, count.index)
  availability_zone       = element(var.azs, count.index)
  map_public_ip_on_launch = true
  # ^ Automatically assigns public IPs to resources launched in this subnet, required for ALB network interfaces to receive internet traffic

  tags = {
    Name        = "Public Subnet ${count.index + 1}"
    Environment = var.environment
  }
}

resource "aws_subnet" "private_subnets" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.vpc_main.id
  cidr_block        = element(var.private_subnet_cidrs, count.index)
  availability_zone = element(var.azs, count.index)

  tags = {
    Name        = "Private Subnet ${count.index + 1}"
    Environment = var.environment
  }
}

resource "aws_internet_gateway" "internet_gateway_main" {
  vpc_id = aws_vpc.vpc_main.id

  tags = {
    Name        = "internet gateway"
    Environment = var.environment
  }
}

# route table for public subnets (where ALB network interfaces will be)
resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.vpc_main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.internet_gateway_main.id
  }

  tags = {
    Name = "${var.environment}-public-route-table"
  }
}

# associate public subnets with public route table
resource "aws_route_table_association" "public_route_table_association" {
  count          = length(var.public_subnet_cidrs)
  subnet_id      = element(aws_subnet.public_subnets[*].id, count.index)
  route_table_id = aws_route_table.public_route_table.id
}

# route table for private subnets (where ECS tasks will run)
resource "aws_route_table" "private_route_table" {
  vpc_id = aws_vpc.vpc_main.id

  tags = {
    Name = "${var.environment}-private-route-table"
  }
}

# associate private subnets with private route table
resource "aws_route_table_association" "private_route_table_association" {
  count          = length(var.private_subnet_cidrs)
  subnet_id      = element(aws_subnet.private_subnets[*].id, count.index)
  route_table_id = aws_route_table.private_route_table.id
}

module "security_groups" {
  source      = "./security_groups"
  environment = var.environment
  vpc_main_id = aws_vpc.vpc_main.id
  vpc_cidr    = var.vpc_cidr
}

resource "aws_db_subnet_group" "rds_subnet_group" {
  name        = "${var.environment}_rds_subnet_group"
  description = "RDS subnet group that points to our private subnets"
  subnet_ids  = aws_subnet.private_subnets[*].id

  tags = {
    Name        = "${var.environment}_rds_subnet_group"
    Environment = var.environment
  }
}
