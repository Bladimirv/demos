#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SqsStack } from '../lib/sqs/sqs-stack';
import { LambdasStack } from '../lib/lambda/lambdas-stack';
import { StepFunctionStack } from '../lib/step-function/sf-practice-stack';

const app = new cdk.App();
const environment = {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    }
};

new SqsStack(app, 'SqsStack', environment);
new LambdasStack(app, 'LambdasStack', environment);
new StepFunctionStack(app, 'StepFunctionStack', environment);
