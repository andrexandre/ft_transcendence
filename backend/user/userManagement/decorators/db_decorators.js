import { sampleBios, sampleCodenames } from "../utils/utils.js";

export const createUser = function (username, email, password, auth_method) {
	
	let columns = "username, email, auth_method, codename, biography";
	let values = "?, ?, ?, ?, ?";
	let params = [username, email, auth_method, sampleCodenames[Math.floor(Math.random() * sampleCodenames.length)], sampleBios[Math.floor(Math.random() * sampleBios.length)]];
	
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

export const getUserByEmail = function (email) {
	const querie = 'SELECT * FROM users WHERE email = ?';
	return this.sqlite.get(querie, [ email ]);
}

export const getUserById = function (id) {
	const querie = 'SELECT * FROM users WHERE id = ?';
	return this.sqlite.get(querie, [ id ]);
}

export const updateUserInformation = function ({ username, codename, biography }, id) {

	const params = [ username, codename, biography, id ];
	const query = `
	UPDATE users
	SET username = ?, codename = ?, biography = ?
	WHERE id = ?;
	`;
	return this.sqlite.run(query, params);
}

export const updateUser2FAStatus = function ({ two_FA_status, two_FA_secret, isSetup }, id) {
	if (!two_FA_secret)
		two_FA_secret = null;
	if(isSetup == true){
		const query = `UPDATE users SET two_FA_status = ?, two_FA_secret = ? WHERE id = ?;`;
		return this.sqlite.run(query, [ two_FA_status, two_FA_secret, id ]);
	}
	else{
		const query = `UPDATE users SET two_FA_status = ? WHERE id = ?;`;
		return this.sqlite.run(query, [ two_FA_status, id ]);
	}
}

export const updateUserStatus = function (username) {
	const querie = `UPDATE users SET is_online = 'TRUE' WHERE username = ?;`;
	return this.sqlite.get(querie, [ username ]);
}

export const updateUserAvatar = function(path, id) {
	const querie = `UPDATE users SET avatar = ? WHERE id = ?;`;
	return this.sqlite.get(querie, [ path , id]);
}

export const createTables = function() {
	const query = `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT, 
		username TEXT NOT NULL UNIQUE,
		email TEXT NOT NULL UNIQUE,
		password TEXT DEFAULT NULL,
		auth_method TEXT NOT NULL,
		codename TEXT NOT NULL,
		biography TEXT NOT NULL,
		avatar TEXT DEFAULT 'default.jpeg',
		two_FA_status BOOLEAN DEFAULT FALSE,
		two_FA_secret TEXT DEFAULT NULL
	);
	`;

	return this.sqlite.run(query);
}

