

export async function registerUsersDecorator(username, email, password) {
    
    return new Promise((resolve, reject) => {
		const friends = {
			
		};
		const friendsJSON = JSON.stringify(friends);
        this.sqlite.run(`INSERT INTO users (username, email, password, is_online, friends) VALUES ('${username}', '${email}', '${password}', 'FALSE', ${friendsJSON});`, (err) => {
            if (err) {
                reject({status: 409, message: 'Username or email already exist!'});
            } else {
                resolve('');
            }
        });
    });
}


export async function getUserByUsernameDecorator(username) {
    
    return new Promise((resolve, reject) => {
        this.sqlite.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
            if (err) {
                reject(err);
            } else if (row) {
                resolve(row);
            } else {
                reject({status: 404, message: 'User not found!'});
            }
          });
    });
}

export async function updateUserStatusDecorator(username) {

	return new Promise((resolve, reject) => {

		const querie = `UPDATE users SET is_online = 'TRUE' WHERE username = ?;`
        this.sqlite.run(querie, [ username ],(err) => {
            if (err) {
                reject(err);
            } else {
                resolve('');
            }
        });
    });
}