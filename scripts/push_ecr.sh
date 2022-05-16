#!/bin/bash

set -e

TAG=`cat CURRENT_USER`


echo "****************************************************"
echo "data.stack:user :: Pushing Image to ECR :: $ECR_URL/data.stack.user:$TAG"
echo "****************************************************"

$(aws ecr get-login --no-include-email)
docker tag data.stack.user:$TAG $ECR_URL/data.stack.user:$TAG
docker push $ECR_URL/data.stack.user:$TAG


echo "****************************************************"
echo "data.stack:user :: Image pushed to ECR AS $ECR_URL/data.stack.user:$TAG"
echo "****************************************************"