# specify the node base image with your desired version node:<version>
FROM node:slim

ENV APP_DIR /home/node/app
ENV NODE_OPTIONS --openssl-legacy-provider #https://github.com/webpack/webpack/issues/14532

WORKDIR $APP_DIR

COPY ./ $APP_DIR

RUN rm -rf $APP_DIR/node_modules
RUN npm install
RUN npm install -g @quasar/cli@1.2.1
RUN quasar build
RUN chmod 744 /home/node/app/start.sh

EXPOSE 8080

ENTRYPOINT ["/home/node/app/start.sh"]
