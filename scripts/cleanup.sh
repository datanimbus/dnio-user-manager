#!/bin/bash

set -e

TAG=`cat CURRENT_USER`

echo "****************************************************"
echo "data.stack:user :: Cleaning Up Local Images :: $TAG"
echo "****************************************************"


docker rmi data.stack.user:$TAG -f