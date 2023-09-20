#!/bin/bash

set -e

TAG=`cat CURRENT_USER`

echo "****************************************************"
echo "datanimbus.io.user :: Pushing Image to Docker Hub :: datanimbus/datanimbus.io.user:$TAG"
echo "****************************************************"

docker tag datanimbus.io.user:$TAG datanimbus/datanimbus.io.user:$TAG
docker push datanimbus/datanimbus.io.user:$TAG

echo "****************************************************"
echo "datanimbus.io.user :: Image Pushed to Docker Hub AS datanimbus/datanimbus.io.user:$TAG"
echo "****************************************************"