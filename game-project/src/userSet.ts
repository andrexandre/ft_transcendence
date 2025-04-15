import { FastifyInstance } from "fastify";
import db_game from "./db_game.js";


// Interfaces
interface MatchData {
	gameMode: string;
	player1Id: string;
	player2Id: string;
	player1Score: number;
	player2Score: number;
	winnerId: string;
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

async function getUserDatafGateway(token: string | undefined): Promise<UserData | null> {
	try {
		const response = await fetch("http://gateway-api:7000/userData", {
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
		console.error("❌ Error fetching user from Gateway:", error);
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

const getUserFromDb = (userId: Number) =>
	new Promise((resolve, reject) => {
		db_game.get("SELECT * FROM users WHERE user_id = ?", [userId], (err, row) => {
			if (err) return reject({ status: 500, error: "Database error", details: err.message });
			resolve(row);
		});
	});

export async function userRoutes(gamefast: FastifyInstance) {
	// Get user data
	gamefast.get("/get-user-data", async (request, reply) => {
		const token: string | undefined = request.cookies.token;

		if (!token) return reply.status(401).send({ error: "No token provided" });

		const userData = await getUserDatafGateway(token);
		if (!userData) return reply.status(401).send({ error: "Failed to fetch user from Gateway" });

		const { username, userId } = userData;

		
		try {
			let row = await getUserFromDb(userId);
			if (!row) {
				console.log(`🆕 User '${username}' not found. Creating...`);
				await new Promise((resolve, reject) => {
					db_game.run(
						"INSERT INTO users (user_id, user_name, user_set_dificulty, user_set_tableSize, user_set_sound) VALUES (?, ?, 'Normal', 'Medium', 1)",
						[userId, username],
						function (err) {
							if (err) return reject({ status: 500, error: "Database error" });
							resolve(null);
						}
					);
				});
				row = { user_id: userId, user_name: username, user_set_dificulty: "Normal", user_set_tableSize: "Medium", user_set_sound: 1 };
			}
			reply.send(row);
		} catch (err: any) {
			reply.status(err.status || 500).send({ error: err.error || "❌ Unknown error" });
		}
	});

	// Save user settings
	gamefast.patch<SaveSettingsRequest>("/save-settings", async (request, reply) => {
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

	// Save match
	gamefast.post("/save-match", (request, reply) => {
		const { gameMode, player1Id, player2Id, player1Score, player2Score, winnerId } = request.body as MatchData;
		// if (!player1Id || !player2Id) return reply.status(400).send({ error: "Missing player IDs" });

		db_game.run(
			`INSERT INTO games (game_mode, game_player1_id, game_player2_id, game_player1_score, game_player2_score, game_winner) VALUES (?, ?, ?, ?, ?, ?)`,
			[gameMode, player1Id, player2Id, player1Score, player2Score, winnerId],
			(err) => {
			  if (err) {
				console.error("❌ DB Insert Error:", err.message);
				return reply.status(500).send({ error: "Database error" });
			  }
			  console.log("✅ Match saved to DB:");
			  reply.status(200).send({ message: "✅ Match saved & sent!" });
			}
		  );
	});

	gamefast.get('/user-game-history', async (request, reply) => {
		
		try {

			const token: string | undefined = request.cookies.token;
			if (!token) return reply.status(401).send({ error: "No token provided" });
			
			// Obtém informações do usuário
			const userData = await getUserDatafGateway(token);
			if (!userData)
				return reply.status(401).send({ error: "Failed to fetch user from Gateway" });

			const user1: any = await getUserFromDb(userData.userId);
			console.log(user1);
			// Obtém histórico do usuário
			const history: GameHistory[] = await getUserHistory(user1.user_id);
			
			// Array de resultados formatados
			const result: any[] = [];
	
			for (const element of history) {
				let user2: any;
				if (element.game_player2_id === 9999) {
					user2 = {user_id: 9999, user_name: 'BoTony'}
				} else {
					if (element.game_player2_id != user1.user_id)
						user2 = await getUserFromDb(element.game_player2_id);
					else
						user2 = await getUserFromDb(element.game_player1_id);
				}
				result.push({
					Mode: element.game_mode,
					winner: {
						username: (element.game_winner === user1.user_id) ? user1.user_name : user2.user_name,
						score: (element.game_winner === user1.user_id) ? element.game_player1_score : element.game_player2_score
					},
					loser: {
						username: (element.game_winner === user1.user_id) ? user2.user_name : user1.user_name,
						score: (element.game_winner === user1.user_id) ? element.game_player2_score : element.game_player1_score
					},
					time: element.game_time
				});
			}
	
			reply.send(JSON.stringify(result, null, 2)); 
		} catch (error) {
			console.error("Erro ao processar histórico:", error);
			reply.status(500).send({ error: `Erro interno no servidor:\n ${error}` });
		}
	});
}
