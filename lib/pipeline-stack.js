const assets = require('./assets');
const cdk = require('@aws-cdk/core');
const iam = require('@aws-cdk/aws-iam');
const ecr = require('@aws-cdk/aws-ecr');
const {DemoStack} = require('./demo-stack');
const pipelines = require('@aws-cdk/pipelines');
const codebuild = require('@aws-cdk/aws-codebuild');
const codecommit = require('@aws-cdk/aws-codecommit');

const name = 'tool-demo';

class DeployStage extends assets.AssetStage {
  constructor(scope, id, props) {
    super(scope, id, props);

    new DemoStack(this, 'DemoStack', {
      stackName: name
    });
  }
}

class PipelineStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const imgRepo = ecr.Repository
      .fromRepositoryName(this, 'EcrRepo', 'node')

    const codeRepo = codecommit.Repository
      .fromRepositoryName(this, 'CodeRepo', name);
  
    const policies = [
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          's3:List*', 
          's3:Get*'],
        resources: [
          'arn:aws:s3:::cfn-guard',
          'arn:aws:s3:::cfn-guard/*'
        ]
      }),
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['ecr:GetAuthorizationToken'],
        resources: ['*']
      }),
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'ecr:BatchCheckLayerAvailability',
          'ecr:GetDownloadUrlForLayer',
          'ecr:GetRepositoryPolicy',
          'ecr:DescribeRepositories',
          'ecr:ListImages',
          'ecr:DescribeImages',
          'ecr:BatchGetImage',
          'ecr:GetLifecyclePolicy',
          'ecr:GetLifecyclePolicyPreview',
          'ecr:ListTagsForResource',
          'ecr:DescribeImageScanFindings'
        ],
        resources: [
          this.formatArn({
            service: 'ecr',
            resource: 'repository',
            resourceName: '*'
          })
        ]
      })
    ];

    const stage = new DeployStage(this, 'Deploy', {
      env: { 
        region: 'us-east-1',
        account: '901796084209'
      }      
    });

    Object.entries(props.tags).forEach(([k,v]) => {
      cdk.Tags.of(this).add(k, v);
      cdk.Tags.of(stage).add(k, v);
    })

    new pipelines.CodePipeline(this, 'Pipeline', {
      pipelineName: name,
      //selfMutation: false,
      
      codeBuildDefaults: {
        rolePolicy: policies,
        buildEnvironment: {
          //enable docker-in-docker
          privileged: true
        }
      },
      dockerCredentials: [
        // authenticate to ecr for base img
        pipelines.DockerCredential.ecr([
          imgRepo
        ])
      ],
      synth: new pipelines.ShellStep('Synth', {
        // can also be GitHub, BitBucket, ...
        input: pipelines
          .CodePipelineSource
          .codeCommit(codeRepo),
        commands: [
          'npm ci',
          'npx cdk synth',
          `bash tools/guard.sh ${stage.artifactId}`
        ]
      })
    })
    .addStage(stage, {
      pre: [
        new pipelines.ShellStep('Scan', {
          commands: [
            // can also build/push image here instead
            `bash tools/scan.sh ${this.account} ${this.region} ${stage.image}`
          ]
        })
      ]
    });
  }
}

module.exports = { PipelineStack }
