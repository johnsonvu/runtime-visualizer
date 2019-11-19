# Dockerfile - Frontend

FROM node:8-alpine

RUN apk add --no-cache git

RUN mkdir -p /vis/frontend
WORKDIR /vis/frontend

COPY package*.json ./

RUN npm install

EXPOSE 3000

COPY . .

CMD [ "npm", "run", "start"]