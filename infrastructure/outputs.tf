output "ec2_public_ip" {
  description = "The public IP address of the backend server"
  value       = aws_instance.backend_server.public_ip
}

output "mongodb_connection_string" {
  description = "The connection string for MongoDB Atlas"
  value       = mongodbatlas_advanced_cluster.atlas_cluster.connection_strings[0].standard_srv
}
