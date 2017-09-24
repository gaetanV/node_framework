FROM node:latest

MAINTAINER Gaetan Vigneron

ENV NODE_ENV=development 
ENV PORT=7200

COPY   . /var/www
WORKDIR   /var/www

RUN  npm install

EXPOSE $PORT

ENTRYPOINT ["npm", "start"]