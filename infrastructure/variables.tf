variable "aws_region" {
  description = "The AWS region to deploy to"
  default     = "us-east-1"
}

variable "ami_id" {
  description = "Ubuntu 22.04 LTS AMI ID for us-east-1"
  default     = "ami-0c7217cdde317cfec" 
}

# Atlas Variables - These MUST be provided via terraform.tfvars or CLI
variable "atlas_public_key" {
  description = "MongoDB Atlas Public API Key"
  type        = string
}

variable "atlas_private_key" {
  description = "MongoDB Atlas Private API Key"
  type        = string
}

variable "atlas_org_id" {
  description = "MongoDB Atlas Organization ID"
  type        = string
}

variable "atlas_project_name" {
  description = "Name for the Atlas Project"
  default     = "DevOpsCompanion"
}
