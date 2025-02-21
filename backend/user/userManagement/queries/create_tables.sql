-- Criar a tabela dos users se ainda não existir
CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT, 
	username TEXT NOT NULL UNIQUE,
	email TEXT NOT NULL UNIQUE,
	password TEXT NOT NULL
);

-- Criar a tabela se ainda não existir
-- CREATE TABLE IF NOT EXISTS friends (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     nome TEXT NOT NULL,
--     -- apelido TEXT
-- );