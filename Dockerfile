FROM node:20.2-alpine
LABEL maintainer="Tomer Zait (realgam3) <realgam3@gmail.com>"

WORKDIR /usr/src/app
COPY . .

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser

RUN set -eux; \
    \
    echo "@edge http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories; \
    echo "@edgecommunity http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories; \
    echo "@testing http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories; \
    \
    apk upgrade -U -a; \
    apk add --no-cache \
      libstdc++@edge \
      chromium@edge \
      harfbuzz@edge \
      nss@edge \
      freetype@edge \
      ttf-freefont@edge \
      font-noto-emoji@edge \
      wqy-zenhei@testing; \
    rm -rf /var/cache/*; \
    mkdir /var/cache/apk; \
    mv local.conf /etc/fonts/local.conf; \
    \
    npm install -g pm2; \
    npm install; \
    \
    adduser -D bot -h /home/bot -s /bin/bash bot; \
    chown -R bot:bot /home/bot /usr/src/app

USER bot
ENV HOME /home/bot

CMD [ "npm", "start" ]
