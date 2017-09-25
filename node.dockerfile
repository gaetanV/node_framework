FROM node:latest

MAINTAINER Gaetan Vigneron


ENV NODE_ENV=development 
ENV PORT = 7200
ENV PORTWS = 8098

COPY   . /var/www
WORKDIR   /var/www

RUN  npm install

EXPOSE $PORT
EXPOSE $PORTWS

ENTRYPOINT ["npm", "start"]