terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }
  required_version = ">= 1.2.0"
}
variable "region" {
  description = "The AWS region to create resources in"
  default     = "us-east-1"
}

resource "aws_sns_topic" "users_created_fifo" {
  name                        = "users-created.fifo"
  fifo_topic                  = true
  content_based_deduplication = true

  tags = {
    Environment = "dev"
    Name        = "users_created_fifo"
  }
}

resource "aws_sqs_queue" "users_created_fifo" {
  name                        = "users-created.fifo"
  fifo_queue                  = true
  content_based_deduplication = true
  delay_seconds               = 0
  max_message_size            = 262144
  message_retention_seconds   = 345600
  receive_wait_time_seconds   = 0
  visibility_timeout_seconds  = 30
}

resource "aws_sns_topic_subscription" "users_created_subscription" {
  topic_arn = aws_sns_topic.users_created_fifo.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.users_created_fifo.arn
}

resource "aws_sqs_queue_policy" "users_created_fifo_policy" {
  queue_url = aws_sqs_queue.users_created_fifo.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = "*"
        Action    = "sqs:SendMessage"
        Resource  = aws_sqs_queue.users_created_fifo.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn" : aws_sns_topic.users_created_fifo.arn
          }
        }
      }
    ]
  })
}
