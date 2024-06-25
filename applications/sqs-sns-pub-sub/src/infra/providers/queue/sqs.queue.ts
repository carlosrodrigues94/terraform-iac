import {
  DeleteMessageBatchCommand,
  DeleteMessageCommand,
  Message,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';

export class SqsQueueConsumer {
  protected client: SQSClient;
  protected queueUrl = '';
  constructor(
    readonly sqsClient: SQSClient,
    readonly config: { queueUrl: string },
  ) {
    this.queueUrl = this.config.queueUrl;
    this.client = this.sqsClient;
  }

  async consume(callback: (data: Message) => Promise<void>) {
    const receiveMessage = (queueUrl) =>
      this.client.send(
        new ReceiveMessageCommand({
          MaxNumberOfMessages: 10,
          MessageAttributeNames: ['All'],
          QueueUrl: queueUrl,
          WaitTimeSeconds: 10,
          VisibilityTimeout: 20,
        }),
      );

    const { Messages } = await receiveMessage(this.queueUrl);

    if (!Messages) {
      return;
    }

    if (Messages.length) {
      for (const message of Messages) {
        console.log('MESSAGE: ', message.Body);
      }
    }
    if (Messages.length === 1) {
      await callback(Messages[0]);

      await this.client.send(
        new DeleteMessageCommand({
          QueueUrl: this.queueUrl,
          ReceiptHandle: Messages[0].ReceiptHandle,
        }),
      );
    }
    if (Messages.length > 1) {
      for await (const message of Messages) {
        await callback(message);

        await this.client.send(
          new DeleteMessageBatchCommand({
            QueueUrl: this.queueUrl,
            Entries: Messages.map((message) => ({
              Id: message.MessageId,
              ReceiptHandle: message.ReceiptHandle,
            })),
          }),
        );
      }
    }
  }
}
