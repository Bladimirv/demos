import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as _lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as sfTasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as sf from 'aws-cdk-lib/aws-stepfunctions';

export class StepFunctionStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        const stepFunctionName = 'sfPractice';
        const eventProducerLambdaArn = ssm.StringParameter.valueForStringParameter(this, '/practice/event-producer-lambda-arn');
        const eventDlqLambdaArn = ssm.StringParameter.valueForStringParameter(this, '/practice/event-dlq-lambda-arn');
        const eventProducerLambda = _lambda.Function.fromFunctionArn(this, 'EventProducerLambda', eventProducerLambdaArn);
        const eventDlqLambda = _lambda.Function.fromFunctionArn(this, 'EventDlqLambda', eventDlqLambdaArn);

        const invokeProducerStep = new sfTasks.LambdaInvoke(this, 'InvokeProducerStep', {
            lambdaFunction: eventProducerLambda
        });

        const invokeDlqStep = new sfTasks.LambdaInvoke(this, 'InvokeDlqStep', {
            lambdaFunction: eventDlqLambda
        });

        new sf.Succeed(this, 'Succeed', {
            comment: 'AWS Batch Job succeeded',
        });

        new sf.Wait(this, 'WaitFiveSeconds', {
            time: sf.WaitTime.duration(cdk.Duration.seconds(5)),
        });

        const definition = invokeProducerStep.next(invokeDlqStep);

        new sf.StateMachine(this, 'StepFunctionPractice', {
            definition: definition,
            timeout: cdk.Duration.minutes(2),
            stateMachineName: stepFunctionName,
            stateMachineType: sf.StateMachineType.STANDARD,
        });
    }
}