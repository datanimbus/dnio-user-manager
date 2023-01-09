#!/bin/bash

set -e

echo "****************************************************"
echo "data.stack:user :: Copying yaml file "
echo "****************************************************"
if [ ! -d yamlFiles ]; then
    mkdir yamlFiles
fi

TAG=`cat CURRENT_USER`

rm -rf yamlFiles/user.*
cp user.yaml yamlFiles/user.$TAG.yaml
cd yamlFiles/
echo "****************************************************"
echo "data.stack:user :: Preparing yaml file "
echo "****************************************************"

sed -i.bak s/__release__/$TAG/ user.$TAG.yaml

echo "****************************************************"
echo "data.stack:user :: yaml file saved"
echo "****************************************************"