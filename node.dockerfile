FROM node:latest

ENV NODE_ENV=development 

RUN mkdir /var/www

COPY package.json /var/www/package.json
WORKDIR   /var/www

RUN  npm install

ENTRYPOINT ["npm", "start"]