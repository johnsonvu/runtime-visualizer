# Dockerfile - Backend

FROM node:8-alpine

RUN apk add --no-cache git

RUN mkdir -p /vis/backend
WORKDIR /vis/backend

COPY package*.json ./

RUN npm install

COPY *.js *.json ./

EXPOSE 3001