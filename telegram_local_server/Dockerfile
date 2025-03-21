FROM ubuntu:22.04
ARG TELEGRAM_BOT_TOKEN=prod
ENV TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN}"
COPY ./telegram-bot-api /usr/local/bin/telegram-bot-api
RUN apt-get update && apt-get install libc++-14-dev -y
RUN mkdir -p /src/${TELEGRAM_BOT_TOKEN}
RUN ln -s /src/${TELEGRAM_BOT_TOKEN} /src/tgdata
WORKDIR src