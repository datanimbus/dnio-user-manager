#!/bin/bash

set -e

TAG=`cat CURRENT_USER`

echo "****************************************************"
echo "data.stack:user :: Saving Image to AWS S3 :: $S3_BUCKET/stable-builds"
echo "****************************************************"

TODAY_FOLDER=`date ++%Y_%m_%d`

docker save -o data.stack.user_$TAG.tar data.stack.user:$TAG
bzip2 data.stack.user_$TAG.tar
aws s3 cp data.stack.user_$TAG.tar.bz2 s3://$S3_BUCKET/stable-builds/$TODAY_FOLDER/data.stack.user_$TAG.tar.bz2
rm data.stack.user_$TAG.tar.bz2

echo "****************************************************"
echo "data.stack:user :: Image Saved to AWS S3 AS data.stack.user_$TAG.tar.bz2"
echo "****************************************************"