#!/bin/bash
set -e
if [ -f $WORKSPACE/../TOGGLE ]; then
    echo "****************************************************"
    echo "data.stack.user :: Toggle mode is on, terminating build"
    echo "data.stack.user :: BUILD CANCLED"
    echo "****************************************************"
	exit 0
fi

cDate=`date +%Y.%m.%d.%H.%M` #Current date and time

if [ -f $WORKSPACE/../CICD ]; then
    CICD=`cat $WORKSPACE/../CICD`
fi
if [ -f $WORKSPACE/../DATA_STACK_RELEASE ]; then
    REL=`cat $WORKSPACE/../DATA_STACK_RELEASE`
fi
if [ -f $WORKSPACE/../DOCKER_REGISTRY ]; then
    DOCKER_REG=`cat $WORKSPACE/../DOCKER_REGISTRY`
fi
BRANCH='dev'
if [ -f $WORKSPACE/../BRANCH ]; then
    BRANCH=`cat $WORKSPACE/../BRANCH`
fi
if [ $1 ]; then
    REL=$1
fi
if [ ! $REL ]; then
    echo "****************************************************"
    echo "data.stack.user :: Please Create file DATA_STACK_RELEASE with the releaese at $WORKSPACE or provide it as 1st argument of this script."
    echo "data.stack.user :: BUILD FAILED"
    echo "****************************************************"
    exit 0
fi
TAG=$REL
if [ $2 ]; then
    TAG=$TAG"-"$2
fi
if [ $3 ]; then
    BRANCH=$3
fi
if [ $CICD ]; then
    echo "****************************************************"
    echo "data.stack.user :: CICI env found"
    echo "****************************************************"
    TAG=$TAG"_"$cDate
    if [ ! -f $WORKSPACE/../DATA_STACK_NAMESPACE ]; then
        echo "****************************************************"
        echo "data.stack.user :: Please Create file DATA_STACK_NAMESPACE with the namespace at $WORKSPACE"
        echo "data.stack.user :: BUILD FAILED"
        echo "****************************************************"
        exit 0
    fi
    DATA_STACK_NS=`cat $WORKSPACE/../DATA_STACK_NAMESPACE`
fi

sh $WORKSPACE/scripts/prepare_yaml.sh $REL $2

echo "****************************************************"
echo "data.stack.user :: Using build :: "$TAG
echo "****************************************************"

cd $WORKSPACE

echo "****************************************************"
echo "data.stack.user :: Adding IMAGE_TAG in Dockerfile :: "$TAG
echo "****************************************************"
sed -i.bak s#__image_tag__#$TAG# Dockerfile

if [ -f $WORKSPACE/../CLEAN_BUILD_USER ]; then
    echo "****************************************************"
    echo "data.stack.user :: Doing a clean build"
    echo "****************************************************"
    
    docker build --no-cache -t data.stack.user:$TAG .
    rm $WORKSPACE/../CLEAN_BUILD_USER

    echo "****************************************************"
    echo "data.stack.user :: Copying deployment files"
    echo "****************************************************"

    if [ $CICD ]; then
        sed -i.bak s#__docker_registry_server__#$DOCKER_REG# user.yaml
        sed -i.bak s/__release_tag__/"'$REL'"/ user.yaml
        sed -i.bak s#__release__#$TAG# user.yaml
        sed -i.bak s#__namespace__#$DATA_STACK_NS# user.yaml
        sed -i.bak '/imagePullSecrets/d' user.yaml
        sed -i.bak '/- name: regsecret/d' user.yaml

        kubectl delete deploy user -n $DATA_STACK_NS || true # deleting old deployement
        kubectl delete service user -n $DATA_STACK_NS || true # deleting old service
        #creating new deployment
        kubectl create -f user.yaml
    fi

else
    echo "****************************************************"
    echo "data.stack.user :: Doing a normal build"
    echo "****************************************************"
	docker build -t data.stack.user:$TAG .
    if [ $CICD ]; then
        if [ $DOCKER_REG ]; then
            kubectl set image deployment/user user=$DOCKER_REG/data.stack.user:$TAG -n $DATA_STACK_NS --record=true
        else 
            kubectl set image deployment/user user=data.stack.user:$TAG -n $DATA_STACK_NS --record=true
        fi
    fi
fi
if [ $DOCKER_REG ]; then
    echo "****************************************************"
    echo "data.stack.user :: Docker Registry found, pushing image"
    echo "****************************************************"

    docker tag data.stack.user:$TAG $DOCKER_REG/data.stack.user:$TAG
    docker push $DOCKER_REG/data.stack.user:$TAG
fi
echo "****************************************************"
echo "data.stack.user :: BUILD SUCCESS :: data.stack.user:$TAG"
echo "****************************************************"
echo $TAG > $WORKSPACE/../LATEST_USER
