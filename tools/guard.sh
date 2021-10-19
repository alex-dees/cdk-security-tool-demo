stagedir=$1
aws s3 cp s3://cfn-guard . --recursive
chmod +x cfn-guard
./cfn-guard validate -r rules -d cdk.out/*.template.json
./cfn-guard validate -r rules -d cdk.out/$stagedir/*.template.json
