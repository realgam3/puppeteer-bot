FROM node:20-slim
LABEL maintainer="Tomer Zait (realgam3) <realgam3@gmail.com>"

ARG USERNAME=app
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /opt/google/chrome/chrome
WORKDIR /usr/src/app
COPY package*.json .

ENV DEBIAN_FRONTEND=noninteractive
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
      gnupg \
      ca-certificates \
      curl; \
    \
    echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list; \
    curl -fsSL https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -; \
    \
    apt-get update; \
    apt-get install -y --no-install-recommends \
      libstdc++6 \
      google-chrome-stable \
      xvfb \
      fonts-freefont-ttf \
      fonts-noto-color-emoji \
      fonts-wqy-zenhei; \
    rm -rf /var/lib/apt/lists/*; \
    \
    npm install -g pm2; \
    npm install; \
    \
    adduser --disabled-password --no-create-home --gecos ${USERNAME} ${USERNAME}

COPY . .

USER ${USERNAME}
ENV HOME=/tmp


CMD [ "npm", "start" ]