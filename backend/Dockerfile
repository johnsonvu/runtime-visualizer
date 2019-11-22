# Dockerfile - Backend

FROM jfloff/alpine-python:2.7

RUN apk add --no-cache git
RUN apk add --update nodejs npm
RUN pip install -U memory_profiler
RUN pip install -U tabulate

RUN mkdir -p /vis/backend
WORKDIR /vis/backend

COPY package*.json ./

RUN npm install

EXPOSE 3001

COPY . .

CMD [ "npm", "run", "start:prod"]