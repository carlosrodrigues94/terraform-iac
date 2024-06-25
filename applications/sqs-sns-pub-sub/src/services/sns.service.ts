import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class SnsService {
  protected topicArn = '';
  constructor(
    @Inject('AWS_SNS_CLIENT') private readonly client: SNSClient,
    private readonly config: { topicArn: string },
  ) {
    this.topicArn = this.config.topicArn;
  }
  async publish(data: Record<string, any>): Promise<any> {
    const command = new PublishCommand({
      Message: JSON.stringify(data),
      MessageDeduplicationId: randomUUID(),
      MessageGroupId: 'users-created',
      MessageAttributes: {
        fifoQueue: {
          DataType: 'String',
          StringValue: 'users-created',
        },
      },
      TopicArn: this.topicArn,
    });

    await this.client.send(command);

    return { ok: true };
  }
}
