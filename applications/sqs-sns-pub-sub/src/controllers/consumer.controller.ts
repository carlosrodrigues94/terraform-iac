import { Message, SQSClient } from '@aws-sdk/client-sqs';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SqsQueueConsumer } from 'src/infra/providers/queue/sqs.queue';

export class ConsumerController extends SqsQueueConsumer {
  constructor(
    @Inject('SQS_QUEUE_CLIENT') readonly client: SQSClient,
    readonly configService: ConfigService,
  ) {
    super(client, { queueUrl: configService.get('SQS_QUEUE') });
    setInterval(() => {
      console.log('Consuming AGAIN');
      this.consume(this.handle);
    }, 5000);
  }

  async handle(data: Message) {
    console.log('MESSAGE =>', data);
  }
}
