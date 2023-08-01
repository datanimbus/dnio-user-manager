#!/bin/bash

set -e

TAG=`cat CURRENT_USER`

echo "****************************************************"
echo "datanimbus.io.user :: Building USER using TAG :: $TAG"
echo "****************************************************"

sed -i.bak s#__image_tag__#$TAG# Dockerfile

if $cleanBuild ; then
    docker build --no-cache -t datanimbus.io.user:$TAG .
else 
    docker build -t datanimbus.io.user:$TAG .
fi


echo "****************************************************"
echo "datanimbus.io.user :: USER Built using TAG :: $TAG"
echo "****************************************************"


echo $TAG > LATEST_USER