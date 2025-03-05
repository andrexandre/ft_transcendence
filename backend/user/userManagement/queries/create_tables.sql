-- Criar a tabela dos users se ainda não existir
CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT, 
	username TEXT NOT NULL UNIQUE,
	email TEXT NOT NULL UNIQUE,
	password TEXT NOT NULL,
	is_online BOOLEAN NOT NULL,
	friends TEXT NOT NULL
);

-- CREATE TABLE IF NOT EXISTS body (
-- 	body_id INTEGER PRIMARY KEY AUTOINCREMENT, 
-- 	altura TEXT NOT NULL,
-- 	peso TEXT NOT NULL,
-- 	user_id INTEGER,
-- 	FOREIGN KEY (user_id) REFERENCES users(id)
-- );

-- Criar a tabela se ainda não existir
-- CREATE TABLE IF NOT EXISTS friends (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     nome TEXT NOT NULL,
--     -- apelido TEXT
-- );