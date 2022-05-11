FROM node:fermium-alpine

RUN apk update
RUN apk upgrade

RUN set -ex; apk add --no-cache --virtual .fetch-deps curl tar git openssl ;

WORKDIR /app

COPY package.json /app

RUN npm install -g npm
RUN npm install --production
RUN npm audit fix
RUN rm -rf /usr/local/lib/node_modules/npm/node_modules/node-gyp/test

COPY api /app/api

COPY app.js /app

COPY config /app/config

COPY util /app/util

ENV IMAGE_TAG=__image_tag__

EXPOSE 10004

RUN mkdir uploads

RUN mkdir downloads

RUN chmod 777 uploads

RUN chmod 777 downloads

CMD node app.js