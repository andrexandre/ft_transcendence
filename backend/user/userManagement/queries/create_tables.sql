-- Criar a tabela dos users se ainda não existir
CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT, 
	username TEXT NOT NULL UNIQUE,
	email TEXT NOT NULL UNIQUE,
	password TEXT NOT NULL,
	is_online BOOLEAN NOT NULL,
	friends TEXT NOT NULL
);
