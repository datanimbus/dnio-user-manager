#!/bin/bash

set -e

TAG=`cat CURRENT_USER`


echo "****************************************************"
echo "datanimbus.io.user :: Deploying Image in K8S :: $NAMESPACE"
echo "****************************************************"

kubectl set image deployment/user user=$ECR_URL/datanimbus.io.user:$TAG -n $NAMESPACE --record=true


echo "****************************************************"
echo "datanimbus.io.user :: Image Deployed in K8S AS $ECR_URL/datanimbus.io.user:$TAG"
echo "****************************************************"