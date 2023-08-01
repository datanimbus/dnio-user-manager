#!/bin/bash

set -e

echo "****************************************************"
echo "datanimbus.io.user :: Copying yaml file "
echo "****************************************************"
if [ ! -d yamlFiles ]; then
    mkdir yamlFiles
fi

TAG=`cat CURRENT_USER`

rm -rf yamlFiles/user.*
cp user.yaml yamlFiles/user.$TAG.yaml
cd yamlFiles/
echo "****************************************************"
echo "datanimbus.io.user :: Preparing yaml file "
echo "****************************************************"

sed -i.bak s/__release__/$TAG/ user.$TAG.yaml

echo "****************************************************"
echo "datanimbus.io.user :: yaml file saved"
echo "****************************************************"