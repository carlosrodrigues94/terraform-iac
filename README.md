## Terraform

<h4>
  This is a Terraform implementation example just for study case.
</h4>

<p>
  This simple implementation of terraform provides 2 services of AWS.
  These two services are SQS and SNS, the Notification service is able to receive a message on "created-user.fifo" topic and the Queue Service that is subscribed on the topic can read this message.
  Inside the folder applications you can just run a nest-js application to test the behavior, just run the application and send a post request to "publish" route and see the result on the terminal.
  There are 2 controllers on this application, one for publish and another for consume, the modules installed are "@aws-sdk/client-sns" and "@aws-sdk/client-sqs".
</p>
