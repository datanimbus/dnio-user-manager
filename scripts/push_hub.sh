#!/bin/bash

set -e

TAG=`cat CURRENT_USER`

echo "****************************************************"
echo "datanimbus.io.user :: Pushing Image to Docker Hub :: appveen/datanimbus.io.user:$TAG"
echo "****************************************************"

docker tag datanimbus.io.user:$TAG appveen/datanimbus.io.user:$TAG
docker push appveen/datanimbus.io.user:$TAG

echo "****************************************************"
echo "datanimbus.io.user :: Image Pushed to Docker Hub AS appveen/datanimbus.io.user:$TAG"
echo "****************************************************"