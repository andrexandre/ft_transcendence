import sqlite3 from "sqlite3";

// Open database connection
const db_game = new sqlite3.Database("/pong_vol/game-project/db_game.db", (err) => {
    if (err) {
        console.error("❌ Error opening game database:", err.message);
    } else {
        console.log("✅ Connected to game database.");
    }
});

// Create tables
db_game.serialize(() => {
    db_game.run(`
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY,
            user_name TEXT UNIQUE NOT NULL,
            user_xp INTEGER DEFAULT 0,
            user_set_dificulty TEXT DEFAULT 'Normal',
            user_set_tableSize TEXT DEFAULT 'Medium',
            user_set_sound BOOLEAN DEFAULT 1
        );
    `);

    db_game.run(`
        CREATE TABLE IF NOT EXISTS games (
            game_id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_tournament_id INTEGER,
            game_mode TEXT NOT NULL,
            game_player1_id INTEGER NOT NULL,
            game_player2_id INTEGER NOT NULL,
            game_player1_score INTEGER DEFAULT 0,
            game_player2_score INTEGER DEFAULT 0,
            game_winner INTEGER,
            game_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (game_player1_id) REFERENCES users(user_id),
            FOREIGN KEY (game_player2_id) REFERENCES users(user_id)
        );
    `);
});

export default db_game;
