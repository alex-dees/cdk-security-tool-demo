account=$1
region=$2
image=$3
registry=$account.dkr.ecr.$region.amazonaws.com

aws ecr get-login-password --region $region | 
docker login --username AWS --password-stdin \
$registry

docker pull $registry/$image

docker run --privileged --rm \
-v /var/run/docker.sock:/var/run/docker.sock \
-v $(pwd):/root/.cache/ public.ecr.aws/aquasecurity/trivy:0.20.0 \
--no-progress --exit-code 1 --severity CRITICAL \
$registry/$image
