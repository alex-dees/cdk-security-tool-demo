const cdk = require('@aws-cdk/core');
const s3 = require('@aws-cdk/aws-s3');
const ec2 = require('@aws-cdk/aws-ec2');
const ecs = require('@aws-cdk/aws-ecs');
const patterns = require('@aws-cdk/aws-ecs-patterns');

class DemoStack extends cdk.Stack {
    /**
     *
     * @param {cdk.Construct} scope
     * @param {string} id
     * @param {cdk.StackProps=} props
     */
    constructor(scope, id, props) {
      super(scope, id, props);

      const vpc = ec2.Vpc.fromLookup(this, 'Vpc', { 
        vpcId: 'vpc-add53ed0'
      });

      new s3.Bucket(this, 'Bucket', {
        encryption: s3.BucketEncryption.KMS,
        removalPolicy: cdk.RemovalPolicy.DESTROY
      });

      const service = new patterns.ApplicationLoadBalancedFargateService(this, 'Service', {
        vpc,
        openListener: false,
        publicLoadBalancer: false,
        taskImageOptions: {
          image: ecs.ContainerImage.fromAsset('./src'),
          containerPort: 80
        }
      });
      
      service.loadBalancer.connections.allowFrom(
        //ec2.Peer.anyIpv4(),
        ec2.Peer.ipv4(vpc.vpcCidrBlock), 
        ec2.Port.tcp(80));
    }
  }
  
  module.exports = { DemoStack }
  