import fastify, { FastifyInstance } from "fastify";
import { lobbies } from "./lobbyManager.js";
import db_game from "./db_game.js";
import { Logger } from "./utils.js";

// Interfaces
interface MatchData {
	gameMode: string;
	player1Id: number;
	player2Id: number;
	player1Score: number;
	player2Score: number;
	winnerId: number;
	// gameTournamentId: string;
}

interface UserData {
	username: string;
	userId: number;
}

interface GameHistory {
	game_mode: string;
	game_player1_id: number;
	game_player2_id: number;
	game_winner: number;
	game_player1_score: number;
	game_player2_score: number;
	game_time: string;
}

interface SaveSettingsRequest {
    Body: {
        username: string;
        difficulty: string;
        tableSize: string;
        sound: number;
    };
}

const initSchema: any = {
	schema: {
	  body: {
		type: 'object',
		required: ['id', 'username'],
		properties: {
			id: { type: 'integer' },
			username: { type: 'string' },
		}
	  }
	}
};

const getUserHistorySchema: any = {
	params: {
		type: 'object',
		required: ['username'],
		properties: { username: { type: 'string', minLength: 3 , maxLength: 15 } },
	}
};
  
export function saveMatchToDatabase(match: MatchData) {
	const db = db_game;
	db.run(
	`INSERT INTO games ( game_mode, game_player1_id, game_player2_id, game_player1_score, game_player2_score, game_winner)
	VALUES (?, ?, ?, ?, ?, ?)`,
	[ match.gameMode, match.player1Id, match.player2Id, match.player1Score, match.player2Score, match.winnerId ],
	(err) => {
		if (err) {
		return Logger.error("❌ DB Insert Error:", err.message);
		}
		Logger.log(`✅ Match saved to DB: ${match.player1Id} vs ${match.player2Id} (${match.gameMode})`);
	}
	);
}
  
export async function getUserDatafGateway(token: string | undefined): Promise<UserData | null> {
	try {
		const response = await fetch('https://nginx-gateway:80/token/verifyToken', {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Cookie": `token=${token}`,
			},
			credentials: "include"
		});
		if (!response.ok) throw new Error(`Failed to fetch user from Gateway: ${response.status} ${response.statusText}`);
		return await response.json();
		
	} catch (error) {
		Logger.error("❌ Error fetching user from Gateway:", error);
		return null;
	}
}

async function getUserHistory(id: any): Promise<GameHistory[]> {
	return new Promise((resolve, reject) => {
	  let content: GameHistory[] = [];
  
	  db_game.each("SELECT * FROM games WHERE game_player1_id = ? or game_player2_id = ?;", [ id, id ], (err, row: GameHistory) => {
		if (err) {
		  reject(err); // Rejeita a Promise em caso de erro
		} else {
		  content.push(row);
		}
	  }, (err, numRows) => {
		if (err) {
		  reject(err); // Se houver erro no processo, rejeita
		} else {
		  resolve(content); // Resolve a Promise com os dados quando terminar
		}
	  });
	});
}

export const getUserById = (userId: Number) =>
	new Promise((resolve, reject) => {
		db_game.get("SELECT * FROM users WHERE user_id = ?", [userId], (err, row) => {
			if (err) return reject({ status: 500, error: "Database error", details: err.message });
			resolve(row);
		});
});

const getUserByUsername = (username: string) =>
	new Promise((resolve, reject) => {
		db_game.get("SELECT * FROM users WHERE user_name = ?", [username], (err, row) => {
			if (err) return reject({ status: 500, error: "Database error", details: err.message });
			resolve(row);
		});
});

export async function userRoutes(gameserver: FastifyInstance, options: any) {

	gameserver.post('/updateUserInfo', async function(request: any, reply: any) {
		
		const token: string | undefined = request.cookies.token;
		if (!token) return reply.status(401).send({ error: "No token provided" });
		try {
			const userData = await getUserDatafGateway(token);
			if (!userData) return reply.status(401).send({ error: "Failed to fetch user from Gateway" });
			
			await new Promise((resolve, reject) => {
				const query: string = `UPDATE users SET user_name = ?  WHERE user_id = ?;`;
				db_game.run(query, [ userData.username, userData.userId ] , function (err) {
					if (err) return reject(false);
					resolve(true);
				});
			});
			
			for (const [, lobby] of lobbies) {
				for (const player of lobby.players) {
				  if (player.userId === userData.userId)
					player.username = userData.username;
				}
			}

			reply.status(200);
			
		} catch (error) {
			return reply.status(500).send({ message: 'Inetrnal server error!'});
		}
		// The new username will be in the given token;
	});

	// Get user data
	gameserver.post('/init-user', initSchema, async function(request: any, reply: any) {
		const { id, username } = request.body;
		const status: boolean = await new Promise((resolve, reject) => {
			const query: string = "INSERT INTO users (user_id, user_name, user_set_dificulty, user_set_tableSize, user_set_sound) VALUES (?, ?, 'Normal', 'Medium', 1)";
			db_game.run(query, [id, username], function (err) {
				if (err) return reject(false);
					resolve(true);
				}
			);
		});

		if (!status)
			return reply.status(500).send({ message: 'Inetrnal server error!'});

		reply.status(200);
	});

	gameserver.get("/get-user-data", async (request, reply) => {
		const token: string | undefined = request.cookies.token;

		if (!token) return reply.status(401).send({ error: "No token provided" });

		const userData = await getUserDatafGateway(token);
		if (!userData) return reply.status(401).send({ error: "Failed to fetch user from Gateway" });

		const { username, userId } = userData;

		try {
			let row = await getUserById(userId);
			reply.send(row);
		} catch (err: any) {
			reply.status(err.status || 500).send({ error: err.error || "❌ Unknown error" });
		}
	});

	// Save user settings
	gameserver.patch<SaveSettingsRequest>("/save-settings", async (request, reply) => {
		const { username, difficulty, tableSize, sound } = request.body;
		if (!username) return reply.status(400).send({ error: "Username is required" });

		try {
			await new Promise<void>((resolve, reject) => {
				db_game.run(
					`UPDATE users SET user_set_dificulty = ?, user_set_tableSize = ?, user_set_sound = ? WHERE user_name = ?`,
					[difficulty, tableSize, sound, username],
					(err) => (err ? reject(err) : resolve())
				);
			});
			reply.send({ message: "✅ Settings updated successfully!" });
		} catch (error) {
			reply.status(500).send({ error: "Database error", details: error instanceof Error ? error.message : "Unknown error" });
		}
	});

	// Get History
	gameserver.get('/:username/user-game-history', getUserHistorySchema, async (request: any, reply: any) => {	
		try {
			const token: string | undefined = request.cookies.token;
			if (!token) return reply.status(401).send({ error: "No token provided" });
			
			// Obtém informações do usuário
			const userData = await getUserDatafGateway(token);
			if (!userData)
				return reply.status(401).send({ error: "Failed to fetch user from Gateway" });

			const { username } = request.params;
			const targetUser: any = await getUserByUsername(username);
			if (!targetUser)
				return reply.status(404).send({ error: "Username not found!" });
			Logger.log(targetUser);
			// Obtém histórico do usuário
			const history: GameHistory[] = await getUserHistory(targetUser.user_id);
			
			// Array de resultados formatados
			const result: any[] = [];
			
	
			for (const element of history) {
				let adversary: any;
				if (element.game_player2_id === 9999) {
					adversary = {user_id: 9999, user_name: 'BoTony'}
				} else {
					if (element.game_player2_id != targetUser.user_id)
						adversary = await getUserById(element.game_player2_id);
					else
						adversary = await getUserById(element.game_player1_id);
				}
				result.push({
					Mode: element.game_mode,
					winner: {
						username: (element.game_winner === targetUser.user_id) ? targetUser.user_name : adversary.user_name,
						score: (element.game_winner === targetUser.user_id) ? element.game_player1_score : element.game_player2_score
					},
					loser: {
						username: (element.game_winner === targetUser.user_id) ? adversary.user_name : targetUser.user_name,
						score: (element.game_winner === targetUser.user_id) ? element.game_player2_score : element.game_player1_score
					},
					time: element.game_time
				});
			}
	
			reply.send(JSON.stringify(result, null, 2)); 
		} catch (error) {
			Logger.error("Erro ao processar histórico:", error);
			reply.status(500).send({ error: `Erro interno no servidor:\n ${error}` });
		}
	});
}
