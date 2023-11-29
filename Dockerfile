FROM node:18-alpine

RUN apk update
RUN apk upgrade

RUN set -ex; apk add --no-cache --virtual .fetch-deps curl tar git openssl ;

WORKDIR /tmp/app

COPY package.json package.json

RUN npm install -g npm
# RUN npm install --production --no-audit
RUN npm i --production
RUN npm audit fix --production

RUN rm -rf /usr/local/lib/node_modules/npm/node_modules/node-gyp/test

RUN mkdir uploads
RUN mkdir downloads

COPY . .

ENV IMAGE_TAG=__image_tag__
ENV NODE_ENV=production

EXPOSE 10004

RUN chmod -R 777 /tmp/app

CMD node app.js