import { loadQueryFile } from "../utils/utils_1.js";

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
		json_object('request', 'true', 'requestorID', ${user2.id}, 'requesteeID', ${user1.id}, 'requestStatus', "PENDING")) 
		WHERE id = ?;`, [id], (err, row) => {
		if (err) {
		  reject(err); // Rejeita a Promise em caso de erro
		} else {
		  resolve('');
		}
	  });
	});
}

export async function acceptFriendRequestDecorator(requestee, requester, id) {
	return new Promise((resolve, reject) => {
		
		this.sqlite.serialize(async () => {
			let query;
			try {
				query = await loadQueryFile('../queries/acceptFriends.sql');
			} catch(err) {
				reject(err);
			}
			console.log(query);
			// const params = {
			// 	requesteeID: requestee.id,
			// 	requesterID: requester.id
			// };
			// console.log(requestee, requester);
			// this.sqlite.get(query, [], (err, row) => {
			// 	if (err) {
			// 		console.log(err);
			// 		reject(err);
			// 	} else {
			// 		console.table(row);
			// 		console.log('Funcionou caralho');
			// 	}
			// });

			resolve('');

		});
	});
}
