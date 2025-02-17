#!/bin/bash

npm install

mkdir Database

touch Database/testDB.db

exec "$@"

