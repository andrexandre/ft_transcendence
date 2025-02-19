#!/bin/bash

npm install

DB_FILE="/pong_vol/game-project/database.sqlite"

# Create db
if [ ! -f "$DB_FILE" ]; then
    echo "📌 Creating SQLite database..."
    sqlite3 "$DB_FILE" <<EOF
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        score INTEGER DEFAULT 0
    );
EOF
    echo "✅ Database created successfully."
else
    echo "📌 Database already exists."
fi

exec "$@"

