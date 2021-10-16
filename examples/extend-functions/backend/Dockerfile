FROM node:16.11.1-alpine
LABEL maintainer="Tomer Zait (realgam3) <realgam3@gmail.com>"

WORKDIR /usr/src/app
COPY . .

RUN set -eux; \
    \
    npm install -g pm2; \
    npm install; \
    \
    adduser -D app -h /home/app -s /bin/bash app; \
    chown -R app:app /home/app /usr/src/app

USER app
ENV HOME /home/app

EXPOSE 3000
CMD ["npm", "start"]
