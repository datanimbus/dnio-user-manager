#!/bin/bash

set -e

TAG=`cat CURRENT_USER`

echo "****************************************************"
echo "data.stack:user :: Pushing Image to Docker Hub :: appveen/data.stack.user:$TAG"
echo "****************************************************"

docker tag data.stack.user:$TAG appveen/data.stack.user:$TAG
docker push appveen/data.stack.user:$TAG

echo "****************************************************"
echo "data.stack:user :: Image Pushed to Docker Hub AS appveen/data.stack.user:$TAG"
echo "****************************************************"