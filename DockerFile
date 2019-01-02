FROM node:8-alpine

WORKDIR /opt/datamanager

COPY package.json ./package.json

RUN npm install

COPY src/ .

CMD ["npm", "start"]