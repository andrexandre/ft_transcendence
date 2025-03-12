#!/bin/bash

npm install

node -e "
const key = require('crypto').randomBytes(64).toString('hex')
console.log('JWT_SECRET_KEY=', key);
" > .env

exec "$@"
