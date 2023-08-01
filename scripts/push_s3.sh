#!/bin/bash

set -e

TAG=`cat CURRENT_USER`

echo "****************************************************"
echo "datanimbus.io.user :: Saving Image to AWS S3 :: $S3_BUCKET/stable-builds"
echo "****************************************************"

TODAY_FOLDER=`date ++%Y_%m_%d`

docker save -o datanimbus.io.user_$TAG.tar datanimbus.io.user:$TAG
bzip2 datanimbus.io.user_$TAG.tar
aws s3 cp datanimbus.io.user_$TAG.tar.bz2 s3://$S3_BUCKET/stable-builds/$TODAY_FOLDER/datanimbus.io.user_$TAG.tar.bz2
rm datanimbus.io.user_$TAG.tar.bz2

echo "****************************************************"
echo "datanimbus.io.user :: Image Saved to AWS S3 AS datanimbus.io.user_$TAG.tar.bz2"
echo "****************************************************"