#!/bin/bash

echo "****************************************************"
echo "odp:user :: Copying yaml file "
echo "****************************************************"
if [ ! -d $WORKSPACE/../yamlFiles ]; then
    mkdir $WORKSPACE/../yamlFiles
fi

REL=$1
if [ $2 ]; then
    REL=$REL-$2
fi

rm -rf $WORKSPACE/../yamlFiles/user.*
cp $WORKSPACE/user.yaml $WORKSPACE/../yamlFiles/user.$REL.yaml
cd $WORKSPACE/../yamlFiles/
echo "****************************************************"
echo "odp:user :: Preparing yaml file "
echo "****************************************************"
sed -i.bak s/__release_tag__/"'$1'"/ user.$REL.yaml
sed -i.bak s/__release__/$REL/ user.$REL.yaml