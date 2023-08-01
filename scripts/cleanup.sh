#!/bin/bash

set -e

TAG=`cat CURRENT_USER`

echo "****************************************************"
echo "datanimbus.io.user :: Cleaning Up Local Images :: $TAG"
echo "****************************************************"


docker rmi datanimbus.io.user:$TAG -f