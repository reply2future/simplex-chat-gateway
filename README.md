# simplex-chat-gateway

A gateway of [simplex-chat](https://github.com/simplex-chat/simplex-chat) for building custom bot.

## What's this?

This project is put the `simplex-chat` terminal to docker container as a gateway to coummunicate with server. I create a [branch](https://github.com/reply2future/simplex-chat/tree/deploy) to support running cli in docker container without input anything, and I would use the official repo `stable` branch after the [PR](https://github.com/simplex-chat/simplex-chat/pull/5208) is merged.

`bot-center` is a sample bot that you can build your own.

## How to use it?

[Tutorial](https://blog.reply2future.pw/article/how-to-create-a-bot-for-simplex-chat-with-typescript)

### Importances

You need to deploy your bot to use the same network with `gateway` container, because of [this security reason](https://github.com/simplex-chat/simplexmq/pull/1280).

More information you could find in [docker-compose.yml](docker-compose.yml) file.