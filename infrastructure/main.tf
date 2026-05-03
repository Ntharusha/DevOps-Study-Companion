terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    mongodbatlas = {
      source  = "mongodb/mongodbatlas"
      version = "~> 1.15.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

provider "mongodbatlas" {
  public_key  = var.atlas_public_key
  private_key = var.atlas_private_key
}

# ==========================================
# AWS EC2 SETUP FOR BACKEND
# ==========================================

# 1. Security Group
resource "aws_security_group" "backend_sg" {
  name        = "devops_companion_backend_sg"
  description = "Allow inbound traffic for Node.js backend"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Backend API Port"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 2. EC2 Instance
resource "aws_instance" "backend_server" {
  ami           = var.ami_id
  instance_type = "t3.micro"
  
  vpc_security_group_ids = [aws_security_group.backend_sg.id]
  
  # Automatically install Node.js and PM2 on boot
  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update -y
              sudo apt-get install -y git curl
              curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
              sudo apt-get install -y nodejs
              sudo npm install -g pm2
              EOF

  tags = {
    Name = "DevOps-Backend-Server"
  }
}

# ==========================================
# MONGODB ATLAS SETUP
# ==========================================

# 1. Create a Project
resource "mongodbatlas_project" "atlas_project" {
  name   = var.atlas_project_name
  org_id = var.atlas_org_id
}

# 2. Create a Free Tier Cluster (M0)
resource "mongodbatlas_advanced_cluster" "atlas_cluster" {
  project_id   = mongodbatlas_project.atlas_project.id
  name         = "DevOpsCluster"
  cluster_type = "REPLICASET"

  replication_specs {
    region_configs {
      electable_specs {
        instance_size = "M0"
      }
      provider_name         = "TENANT"
      backing_provider_name = "AWS"
      region_name           = "US_EAST_1"
      priority              = 7
    }
  }
}

# 3. Create Database User
resource "mongodbatlas_database_user" "db_user" {
  username           = "devops_user"
  password           = "supersecretpassword123" # In production, use Terraform secrets!
  project_id         = mongodbatlas_project.atlas_project.id
  auth_database_name = "admin"

  roles {
    role_name     = "readWriteAnyDatabase"
    database_name = "admin"
  }
}

# 4. Allow the EC2 Server to connect to the database
resource "mongodbatlas_project_ip_access_list" "ec2_access" {
  project_id = mongodbatlas_project.atlas_project.id
  ip_address = aws_instance.backend_server.public_ip
  comment    = "Allow backend EC2 server"
}
