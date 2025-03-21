FROM ubuntu:22.04
ARG TELEGRAM_BOT_TOKEN=bottoken
ENV TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN}"
RUN apt-get update && apt-get install make git zlib1g-dev libssl-dev gperf cmake clang-14 libc++-14-dev libc++abi-14-dev -y
COPY ./telegram-bot-api /src/telegram-bot-api
RUN chmod +x /src/telegram-bot-api/build_server.sh
RUN ./src/telegram-bot-api/build_server.sh
RUN mkdir -p /src/${TELEGRAM_BOT_TOKEN}
RUN ln -s /src/${TELEGRAM_BOT_TOKEN} /src/tgdata