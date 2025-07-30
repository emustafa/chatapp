output "users_table_name" {
  description = "Name of the Users DynamoDB table"
  value       = aws_dynamodb_table.users.name
}

output "users_table_arn" {
  description = "ARN of the Users DynamoDB table"
  value       = aws_dynamodb_table.users.arn
}

output "sessions_table_name" {
  description = "Name of the Sessions DynamoDB table"
  value       = aws_dynamodb_table.sessions.name
}

output "sessions_table_arn" {
  description = "ARN of the Sessions DynamoDB table"
  value       = aws_dynamodb_table.sessions.arn
}

output "chat_threads_table_name" {
  description = "Name of the ChatThreads DynamoDB table"
  value       = aws_dynamodb_table.chat_threads.name
}

output "chat_threads_table_arn" {
  description = "ARN of the ChatThreads DynamoDB table"
  value       = aws_dynamodb_table.chat_threads.arn
}

output "messages_table_name" {
  description = "Name of the Messages DynamoDB table"
  value       = aws_dynamodb_table.messages.name
}

output "messages_table_arn" {
  description = "ARN of the Messages DynamoDB table"
  value       = aws_dynamodb_table.messages.arn
}