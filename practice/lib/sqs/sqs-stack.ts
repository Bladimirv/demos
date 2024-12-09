import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class SqsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const sqsName = 'PracticeQueue';
    const sqsDlqName = `${sqsName}-dlq`;

    const sqsPracticeDlq = new sqs.Queue(this, sqsDlqName, {
      queueName: sqsDlqName,
      retentionPeriod: cdk.Duration.days(14),
    });

    const sqsPratice = new sqs.Queue(this, sqsName, {
      queueName: sqsName,
      deadLetterQueue: {
        maxReceiveCount: 3,
        queue: sqsPracticeDlq,
      },
      visibilityTimeout: cdk.Duration.seconds(30),
    });

    new ssm.StringParameter(this, 'QueueArn', {
      parameterName: '/practice/queue-arn',
      stringValue: sqsPratice.queueArn,
    });

    new ssm.StringParameter(this, 'QueueUrl', {
      parameterName: '/practice/queue-url',
      stringValue: sqsPratice.queueUrl,
    });

    new ssm.StringParameter(this, 'QueueUrlDlq', {
      parameterName: '/practice/queue-dlq-url',
      stringValue: sqsPracticeDlq.queueUrl,
    });

    new ssm.StringParameter(this, 'QueueArnDlq', {
      parameterName: '/practice/queue-dlq-arn',
      stringValue: sqsPracticeDlq.queueArn,
    });
  }
}
