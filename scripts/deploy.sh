#!/bin/bash

set -e

TAG=`cat CURRENT_USER`


echo "****************************************************"
echo "data.stack:user :: Deploying Image in K8S :: $NAMESPACE"
echo "****************************************************"

kubectl set image deployment/user user=$ECR_URL/data.stack.user:$TAG -n $NAMESPACE --record=true


echo "****************************************************"
echo "data.stack:user :: Image Deployed in K8S AS $ECR_URL/data.stack.user:$TAG"
echo "****************************************************"