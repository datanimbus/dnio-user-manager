#!/bin/bash

set -e

TAG=`cat CURRENT_USER`

echo "****************************************************"
echo "data.stack:user :: Building USER using TAG :: $TAG"
echo "****************************************************"


if [ $cleanBuild ]; then
    docker build --no-cache -t data.stack.user:$TAG .
else 
    docker build -t data.stack.user:$TAG .
fi


echo "****************************************************"
echo "data.stack:user :: USER Built using TAG :: $TAG"
echo "****************************************************"


echo $TAG > LATEST_USER