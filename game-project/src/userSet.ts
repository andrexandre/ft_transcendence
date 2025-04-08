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
	userId: string;
}

interface SaveSettingsRequest {
    Body: {
        username: string;
        difficulty: string;
        tableSize: string;
        sound: number;
    };
}

async function fetchUserDataFromGateway(token: string | undefined): Promise<UserData | null> {
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

async function sendMatchToAPI(matchData: MatchData) {
	try {
		const response = await fetch("http://gateway-api:7000/matchHistory", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(matchData),
		});

		if (!response.ok) {
			throw new Error(`Failed to send match: ${response.status} ${response.statusText}`);
		}

		console.log("✅ Match successfully sent to API:", matchData);
		return true;
	} catch (error) {
		console.error("❌ Error sending match to API:", error);
		return false;
	}
}

export async function userRoutes(gamefast: FastifyInstance) {
	// Get user data
	gamefast.get("/get-user-data", async (request, reply) => {
		const token: string | undefined = request.cookies.token;

		if (!token) return reply.status(401).send({ error: "No token provided" });

		const userData = await fetchUserDataFromGateway(token);
		if (!userData) return reply.status(401).send({ error: "Failed to fetch user from Gateway" });

		const { username, userId } = userData;

		const getUserFromDb = () =>
			new Promise((resolve, reject) => {
				db_game.get("SELECT * FROM users WHERE user_id = ?", [userId], (err, row) => {
					if (err) return reject({ status: 500, error: "Database error", details: err.message });
					resolve(row);
				});
			});

		try {
			let row = await getUserFromDb();
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
	gamefast.post("/save-match", async (request, reply) => {
		const { gameMode, player1Id, player2Id, player1Score, player2Score, winnerId } = request.body as MatchData;
		if (!player1Id || !player2Id) return reply.status(400).send({ error: "Missing player IDs" });

		db_game.run(
			`INSERT INTO games (game_mode, game_player1_id, game_player2_id, game_player1_score, game_player2_score, game_winner) VALUES (?, ?, ?, ?, ?, ?)`,
			[gameMode, player1Id, player2Id, player1Score, player2Score, winnerId],
			async function (err) {
				if (err) return reply.status(500).send({ error: "Database error", details: err.message });

				const matchData = { matchId: this.lastID, gameMode, player1Id, player2Id, player1Score, player2Score, winnerId };
				const success = await sendMatchToAPI(matchData);

				reply.send({ message: success ? "✅ Match saved & sent!" : "⚠ Match saved, but API sync failed.", matchId: this.lastID });
			}
		);
	});
}
