#!/bin/bash

#configure .env file
echo SERVICE_BACKEND_URL=${SERVICE_BACKEND_URL} > ${APP_DIR}/.env
echo SERVICE_USERNAME=${SERVICE_USERNAME} >> ${APP_DIR}/.env
echo SERVICE_PASSWORD=${SERVICE_PASSWORD} >> ${APP_DIR}/.env

#start frontend
echo "Starting frontend ..."
quasar dev
