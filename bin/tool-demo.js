#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { PipelineStack } = require('../lib/pipeline-stack');

const app = new cdk.App();

const stack = new PipelineStack(app, 'PipelineStack', {
  tags: {
    application: 'tool-demo'
  },
  stackName: 'tool-demo-pipeline',
  env: { 
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT
  }
});