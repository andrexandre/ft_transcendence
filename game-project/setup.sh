#!/bin/bash

npm install
npm install @fastify/static
npm install @fastify/websocket
npm install ts-node typescript
npm install --save-dev ts-node typescript

# tsc
# npx ts-node server.ts

exec "$@"