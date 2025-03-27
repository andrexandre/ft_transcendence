import { loadQueryFile } from "../utils/utils_1.js";


export const createUser = function (username, email, password, auth_method) {
	
	let columns = "username, email, auth_method, is_online, friends";
	let values = "?, ?, ?, 'FALSE', json_array()";
	let params = [username, email, auth_method];

	if (password) {
		columns = "username, email, password, auth_method, is_online, friends";
		values = "?, ?, ?, ?, 'FALSE', json_array()";
		params.splice(2, 0, password); // Insere a senha na posição correta
	}

	const query = `--sql
					INSERT INTO users (${columns}) VALUES (${values});`;
	return this.db.run(query, params);
}

export const getUserByUsername = function (username) {
	const querie = 'SELECT * FROM users WHERE username = ?';
	return this.db.get(querie, [ username ]);
}

export const updateUserStatus = function (username) {
	const querie = `UPDATE users SET is_online = 'TRUE' WHERE username = ?;`;
	return this.db.get(querie, [ username ]);
}

export const createFriendRequest = function (user1, user2, id) {
	const querie = `UPDATE users 
		SET friends = json_insert(friends, '$[#]',
		json_object('request', 'true', 'requestorID', ${user2.id}, 'requesteeID', ${user1.id}, 'requestStatus', "PENDING")) 
		WHERE id = ?;`;
	return this.db.run(querie, [ id ]);
}



const transactionQuery = {
	"BEGIN": `BEGIN TRANSACTION;`,
	"COMMIT": `COMMIT;`,
	"FIRST_UPDATE": `--sql
					WITH indice AS (
						SELECT key, value
						FROM json_each((SELECT friends FROM users WHERE id = $requesteeID ))
						WHERE json_extract(value, '$.requestorID') = $requesterID
					)
					UPDATE users 
					SET friends = json_set(
						friends,
						'$[' || (SELECT key FROM indice) || ']',
						json_object('friendship', 'true', 'friendID', $requesterID, 'friendshipStatus', $status)
					)
					WHERE id = $requesteeID;`,
	"SECOND_UPDATE": `--sql
					WITH indice AS (
						SELECT key, value
						FROM json_each((SELECT friends FROM users WHERE id = $requesterID ))
						WHERE json_extract(value, '$.requesteeID') = $requesteeID
					)
					UPDATE users 
					SET friends = json_set(
						friends,
						'$[' || (SELECT key FROM indice) || ']',
						json_object('friendship', 'true', 'friendID', $requesteeID, 'friendshipStatus', $status)
					)
					WHERE id = $requesterID;`
};



export const acceptFriendRequest = async function (requestee, requester, id) {

	try {
		const content = await loadQueryFile('../queries/acceptFriends.sql');
		const queries = content.split(/\r?\n\r?\n/);
		const params = {
			$requesteeID: requestee.id,
			$requesterID: requester.id,
			$status: 'ACCEPTED'
		};
		console.log("ELE usou esta funcao aqui");
		await this.db.run(queries[0]);
		console.log("BEGIN done");
		
		await this.db.run(queries[1], params);
		console.log("FIRST update done");
		await this.db.run(queries[2], params);
		console.log("SECOND update done");
		await this.db.run(queries[3]);
		console.log("COMMIT");

	} catch(err) {
		await this.db.run("ROLLBACK;");
		throw err;
	}
}

// export async function createFriendRequestDecorator(user1, user2, id) {
// 	return new Promise((resolve, reject) => {

// 	  this.sqlite.run(`UPDATE users 
// 		SET friends = json_insert(friends, '$[#]',
// 		json_object('request', 'true', 'requestorID', ${user2.id}, 'requesteeID', ${user1.id}, 'requestStatus', "PENDING")) 
// 		WHERE id = ?;`, [id], (err, row) => {
// 		if (err) {
// 		  reject(err); // Rejeita a Promise em caso de erro
// 		} else {
// 		  resolve('');
// 		}
// 	  });
// 	});
// }

// export async function acceptFriendRequestDecorator(requestee, requester, id) {
// 	return new Promise((resolve, reject) => {
// 		this.sqlite.serialize(async () => {

// 			let content;
// 			try {
// 				content = await loadQueryFile('../queries/acceptFriends.sql');
// 			} catch(err) {
// 				reject(err);
// 			}
// 			console.log(content);
// 			const queries = content.split(/\r?\n\r?\n/);

// 			const params = {
// 				$requesteeID: requestee.id,
// 				$requesterID: requester.id,
// 				$status: 'ACCEPTED'
// 			};
// 			console.log(queries);
// 			function f(err) {
// 				if (err) {
// 					console.log(err);
// 					reject(err);
// 				}
// 			}
// 			this.sqlite.run(queries[0], f);
// 			this.sqlite.run(queries[1], params, f);
// 			this.sqlite.run(queries[2], params, f);
// 			this.sqlite.run(queries[3], f);
// 			resolve('');

// 		});
// 	});
// }
