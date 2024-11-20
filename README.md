# simplex-chat-gateway

A gateway of [simplex-chat](https://github.com/simplex-chat/simplex-chat) for building custom bot.

## What's this?

This project is put the `simplex-chat` terminal to docker container as a gateway to coummunicate with server. I create a [branch](https://github.com/reply2future/simplex-chat/tree/deploy) to support running cli in docker container without input anything, and I would use the official repo `stable` branch after the [PR](https://github.com/simplex-chat/simplex-chat/pull/5208) is merged.

`bot-center` is a sample bot that you can build your own.

## How to use it?

1. Create a `docker-compose.yml` file

```docker-compose.yml
services:
  gateway:
    container_name: simplex-chat-gateway
    image: feimeizhan/simplex-chat-gateway:deploy
    build:
      dockerfile: Dockerfile
    command:
      - --database=${DEVICE_NAME}
      - --device-name=${DEVICE_NAME}
      - --display-name=${DISPLAY_NAME}
      - --chat-server-port=${WS_PORT}
      - --server=${SMP_SERVER}
      - --xftp-server=${XFTP_SERVER}
      - --files-folder=/files
      - --log-level=debug
      - --log-file=/files/test.log
      - -y
    volumes:
      - ./tmp/db:/db
      - ./tmp/files:/files
    restart: unless-stopped
    network_mode: host # it must be that value cause of [this](https://github.com/simplex-chat/simplexmq/pull/1280)
```

2. copy the `.env-template` to `.env` and fill the values
3. run it with `docker-compose up -d` command.

### Importances

You need to deploy your bot to use the same network with `gateway` container, because of [this security reason](https://github.com/simplex-chat/simplexmq/pull/1280).

More information you could find in [docker-compose.yml](docker-compose.yml) file.