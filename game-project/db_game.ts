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
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_name TEXT UNIQUE NOT NULL,
            user_xp INTEGER DEFAULT 0,
            user_set_dificulty TEXT DEFAULT 'normal',
            user_set_tableSize TEXT DEFAULT 'medium',
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

    console.log("Tables ensured.");
    
    // // remove after API request
    // db_game.run(
    //     `INSERT OR IGNORE INTO users (user_name, user_xp, user_set_dificulty, user_set_tableSize, user_set_sound)
    //      VALUES 
    //      ('Player1', 100, 'hard', 'large', 1),
    //      ('Player2', 50, 'normal', 'medium', 1),
    //      ('Player3', 30, 'easy', 'small', 0),
    //      ('Player4', 80, 'hard', 'medium', 1);`,
    //     (err) => {
    //         if (err) {
    //             console.error("❌ Error inserting default users:", err.message);
    //         } else {
    //             console.log("✅ Default users added to the database.");
    //         }
    //     }
    // );
});

export default db_game;
