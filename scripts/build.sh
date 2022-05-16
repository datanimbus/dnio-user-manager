#!/bin/bash

set -e

TAG=`cat CURRENT_USER`

echo "****************************************************"
echo "data.stack:user :: Building USER using TAG :: $TAG"
echo "****************************************************"


docker build -t data.stack.user:$TAG .


echo "****************************************************"
echo "data.stack:user :: USER Built using TAG :: $TAG"
echo "****************************************************"


echo $TAG > LATEST_USER