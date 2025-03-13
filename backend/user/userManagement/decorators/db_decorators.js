

export async function registerUsersDecorator(username, email, password) {
    
    return new Promise((resolve, reject) => {
		const friends = {
			
		};
		const querie = `INSERT INTO users (username, email, password, is_online, friends) VALUES ('${username}', '${email}', '${password}', 'FALSE', json_array());`;
        this.sqlite.run(querie, (err) => {
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


export async function createFriendRequestDecorator(user1, user2, id) {
	return new Promise((resolve, reject) => {

	  this.sqlite.run(`UPDATE users 
		SET friends = json_insert(friends, '$[#]',
		json_object('request', 'true', 'requestorID', '${user2.id}', 'requesteeID', '${user1.id}', 'requestStatus', "PENDING")) 
		WHERE id = ?;`, [id], (err, row) => {
		if (err) {
		  reject(err); // Rejeita a Promise em caso de erro
		} else {
		  resolve('');
		}
	  });
	});
}

export async function acceptFriendRequestDecorator(user1, user2, id) {
	return new Promise((resolve, reject) => {
		
		this.sqlite.serialize(() => {
			
			const indice = this.sqlite.get(`
				SELECT key, value
				FROM json_each((SELECT friends FROM users WHERE username = ${user1.username}))
				WHERE json_extract(value, '$.requestorID') = '${user1.id}';`
			);
			console.table(indice);


			// this.sqlite.run(`UPDATE users 
			// SET friends = json_set
			// (
			// 	friends, '$[#]',	
			// 	json_object('request', 'true', 'requestorID', '${user2.id}', 'requesteeID', '${user1.id}', 'requestStatus', "PENDING")
			// ) 
			// WHERE id = ?;`, [id], (err, row) => {
			// if (err) {
			// reject(err); // Rejeita a Promise em caso de erro
			// } else {
			// resolve('');
			// }
			// });

		});
	});
}
