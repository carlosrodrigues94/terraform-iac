import { SNSClient } from '@aws-sdk/client-sns';
import { SQSClient } from '@aws-sdk/client-sqs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConsumerController } from './controllers/consumer.controller';
import { PublisherController } from './controllers/publisher.controller';
import { SnsService } from './services/sns.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
    }),
  ],
  controllers: [PublisherController],
  providers: [
    {
      provide: 'NOTIFICATION_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const client = new SNSClient({
          credentials: {
            accessKeyId: configService.get<string>('AWS_IAM_KEY', ''),
            secretAccessKey: configService.get<string>('AWS_IAM_SECRET', ''),
          },
        });
        const topicArn = configService.get('SNS_TOPIC_ARN');

        return new SnsService(client, { topicArn });
      },
    },
    {
      provide: 'SQS_QUEUE_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new SQSClient({
          credentials: {
            accessKeyId: configService.get<string>('AWS_IAM_KEY', ''),
            secretAccessKey: configService.get<string>('AWS_IAM_SECRET', ''),
          },
        });
      },
    },
    // {
    //   provide: 'SQS_QUEUE_CONSUMER',
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => {
    //     const queueUrl = configService.get<string>('QUEUE_URL');
    //     const sqsClient = new SQSClient({
    //       credentials: {
    //         accessKeyId: configService.get<string>('AWS_IAM_KEY', ''),
    //         secretAccessKey: configService.get<string>('AWS_IAM_SECRET', ''),
    //       },
    //     });
    //     new SqsQueueConsumer(sqsClient, { queueUrl });
    //   },
    // },

    ConsumerController,
  ],
})
export class AppModule {}
