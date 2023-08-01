#!/bin/bash

set -e

TAG=`cat CURRENT_USER`


echo "****************************************************"
echo "datanimbus.io.user :: Pushing Image to ECR :: $ECR_URL/datanimbus.io.user:$TAG"
echo "****************************************************"

$(aws ecr get-login --no-include-email)
docker tag datanimbus.io.user:$TAG $ECR_URL/datanimbus.io.user:$TAG
docker push $ECR_URL/datanimbus.io.user:$TAG


echo "****************************************************"
echo "datanimbus.io.user :: Image pushed to ECR AS $ECR_URL/datanimbus.io.user:$TAG"
echo "****************************************************"