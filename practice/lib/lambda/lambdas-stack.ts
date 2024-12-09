import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as _lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as eventSource from 'aws-cdk-lib/aws-lambda-event-sources';

export class LambdasStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const queueArn = ssm.StringParameter.valueForStringParameter(this, '/practice/queue-arn');
        const queueUrl = ssm.StringParameter.valueForStringParameter(this, '/practice/queue-url');

        const queueDlqUrl = ssm.StringParameter.valueForStringParameter(this, '/practice/queue-dlq-url');
        const queueDlqArn = ssm.StringParameter.valueForStringParameter(this, '/practice/queue-dlq-arn');

        const queueFromArn = sqs.Queue.fromQueueArn(this, 'QueueFromArn', queueArn);
        const queueDlqFromArn = sqs.Queue.fromQueueArn(this, 'QueueFromArnDlq', queueDlqArn);

        const eventProducerLambdaName = 'EventProducerLambda';
        const eventConsumerLambdaName = 'EventConsumerLambda';
        const eventDlqLambdaName = 'EventDlqLambda';

        const eventProducerLambda = new _lambda.Function(this, eventProducerLambdaName, {
            functionName: eventProducerLambdaName,
            timeout: cdk.Duration.seconds(10),
            environment: {
                SQS_QUEUE_URL: queueUrl,
            },
            runtime: _lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: _lambda.Code.fromAsset('_codes/event-producer'),
        });

        const eventConsumerLambda = new _lambda.Function(this, eventConsumerLambdaName, {
            functionName: eventConsumerLambdaName,
            timeout: cdk.Duration.seconds(10),
            runtime: _lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: _lambda.Code.fromAsset('_codes/event-consumer'),
        });

        const eventDlqLambda = new _lambda.Function(this, eventDlqLambdaName, {
            functionName: eventDlqLambdaName,
            timeout: cdk.Duration.seconds(10),
            environment: {
                SQS_DLQ_QUEUE_URL: queueDlqUrl,
            },
            runtime: _lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: _lambda.Code.fromAsset('_codes/event-dlq'),
        });

        eventConsumerLambda.addEventSource(new eventSource.SqsEventSource(queueFromArn));
        queueFromArn.grantSendMessages(eventProducerLambda);
        queueDlqFromArn.grantConsumeMessages(eventDlqLambda);

        new ssm.StringParameter(this, 'EventProducerLambdaArn', {
            parameterName: '/practice/event-producer-lambda-arn',
            stringValue: eventProducerLambda.functionArn,
        });

        new ssm.StringParameter(this, 'EventDlqLambdaArn', {
            parameterName: '/practice/event-dlq-lambda-arn',
            stringValue: eventDlqLambda.functionArn,
        });
    }
}