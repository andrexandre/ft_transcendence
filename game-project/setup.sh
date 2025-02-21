#!/bin/bash

npm install

DB_FILE="/pong_vol/game-project/db_game.db"

# Check if database exists
if [ ! -f "$DB_FILE" ]; then
    echo "📌 Creating empty SQLite database..."
    touch "$DB_FILE"
    echo "✅ Database initialized."
else
    echo "📌 Database already exists."
fi

exec "$@"

