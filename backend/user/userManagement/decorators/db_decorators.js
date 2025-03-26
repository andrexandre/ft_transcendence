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

export const createFriendRequest = function (user1, user2, id) {
	const querie = `UPDATE users 
		SET friends = json_insert(friends, '$[#]',
		json_object('request', 'true', 'requestorID', ${user2.id}, 'requesteeID', ${user1.id}, 'requestStatus', "PENDING")) 
		WHERE id = ?;`;
	return this.sqlite.run(querie, [ id ]);
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
		await this.sqlite.run(queries[0]);
		console.log("BEGIN done");
		
		await this.sqlite.run(queries[1], params);
		console.log("FIRST update done");
		await this.sqlite.run(queries[2], params);
		console.log("SECOND update done");
		await this.sqlite.run(queries[3]);
		console.log("COMMIT");

	} catch(err) {
		await this.sqlite.run("ROLLBACK;");
		throw err;
	}
}

