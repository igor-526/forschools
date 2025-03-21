FROM ubuntu:22.04
ARG TELEGRAM_BOT_TOKEN=bottoken
ARG TELEGRAM_API_ID=apiid
ARG TELEGRAM_API_HASH=apihash
ENV TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN}"
ENV TELEGRAM_API_ID="${TELEGRAM_API_ID}"
ENV TELEGRAM_API_HASH="${TELEGRAM_API_HASH}"
RUN apt-get update && apt-get install make git zlib1g-dev libssl-dev gperf cmake clang-14 libc++-14-dev libc++abi-14-dev -y
COPY ./telegram-bot-api /src/telegram-bot-api
RUN chmod +x /src/telegram-bot-api/build_server.sh
RUN ./src/telegram-bot-api/build_server.sh
RUN mkdir -p /src/${TELEGRAM_BOT_TOKEN}
RUN ln -s /src/${TELEGRAM_BOT_TOKEN} /src/tgdata
ENTRYPOINT ["python", "--api-id=${TELEGRAM_API_ID}", "--api-hash=${TELEGRAM_API_HASH}", "--http-ip-address=0.0.0.0", "--http-port=8083", "--dir=/src"]