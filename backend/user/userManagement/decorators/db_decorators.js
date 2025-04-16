import { sampleBios } from "../utils/utils.js";

export const createUser = function (username, email, password, auth_method) {
	
	let columns = "username, email, auth_method, codename, biography";
	let values = "?, ?, ?, ?, ?";
	let params = [username, email, auth_method, "King of Pirates", sampleBios[Math.floor(Math.random() * (sampleBios.length + 1))]];

	if (password) {
		columns = "username, email, password, auth_method, codename, biography";
		values = "?, ?, ?, ?, ?, ?";
		params.splice(2, 0, password);
	}

	const query = `--sql
					INSERT INTO users (${columns}) VALUES (${values});`;
	return this.sqlite.run(query, params);
}

export const getUserByUsername = function (username) {
	const querie = 'SELECT * FROM users WHERE username = ?';
	return this.sqlite.get(querie, [ username ]);
}


export const updateUserStatus = function (username) {
	const querie = `UPDATE users SET is_online = 'TRUE' WHERE username = ?;`;
	return this.sqlite.get(querie, [ username ]);
}

export const createTables = function() {
	const query = `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT, 
		username TEXT NOT NULL UNIQUE,
		email TEXT NOT NULL UNIQUE,
		password TEXT DEFAULT NULL,
		auth_method TEXT NOT NULL,
		is_online BOOLEAN DEFAULT FALSE,
		codename TEXT NOT NULL,
		biography TEXT NOT NULL,
		avatar TEXT DEFAULT 'default.jpeg',
		two_FA_status BOOLEAN DEFAULT TRUE
	);
	`;

	return this.sqlite.run(query);
}

