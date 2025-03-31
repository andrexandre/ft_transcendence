
export const createUser = function (username, email, password, auth_method) {
	
	let columns = "username, email, auth_method, is_online, friends";
	let values = "?, ?, ?, 'FALSE', json_array()";
	let params = [username, email, auth_method];

	if (password) {
		columns = "username, email, password, auth_method, is_online, friends";
		values = "?, ?, ?, ?, 'FALSE', json_array()";
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


