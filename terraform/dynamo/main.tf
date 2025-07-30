terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_dynamodb_table" "users" {
  name           = "Users"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  tags = {
    Name        = "Users"
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "sessions" {
  name           = "Sessions"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "sessionId"

  attribute {
    name = "sessionId"
    type = "S"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  tags = {
    Name        = "Sessions"
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "chat_threads" {
  name           = "ChatThreads"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"
  range_key      = "threadId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "threadId"
    type = "S"
  }

  tags = {
    Name        = "ChatThreads"
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "messages" {
  name           = "Messages"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "threadId"
  range_key      = "messageId"

  attribute {
    name = "threadId"
    type = "S"
  }

  attribute {
    name = "messageId"
    type = "S"
  }

  tags = {
    Name        = "Messages"
    Environment = var.environment
  }
}
