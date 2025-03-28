import fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyStatic from "@fastify/static";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt"
import path from "path";
import db_game from "./db_game.js";

const gamefast = fastify({ logger: true });

// The cors import and use is temporary
import cors from '@fastify/cors';
gamefast.register(cors, {
	origin: ['http://127.0.0.1:5500'],
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	credentials: true
});

gamefast.register(fastifyWebsocket);
gamefast.register(fastifyCookie);
gamefast.register(fastifyStatic, {
    root: path.join(process.cwd(), "src"), //../src
    prefix: "/",
});
gamefast.register(fastifyJwt, { secret: "supersecret" });

// lobbys
const lobbies: Record<string, { 
    lobbyId: string;
    gameType: string; 
    tournamentId?: string;
    maxPlayers: number;
    players: { id: string; username: string }[];
    hostId: string;
}> = {};

// WebSocket Route 
gamefast.get("/ws", { websocket: true }, (connection, req) => {
    console.log("🔌 New WebSocket connection!");

    connection.on("message", (message: string) => {
        console.log("📩 Received message:", message.toString());
    });

    connection.on("close", () => {
        console.log("🔌 WebSocket disconnected");
    });
    connection.on("error", (err: string) => {
        console.error("⚠ WebSocket error:", err);
    });
    
});

// Fetch user data from Gateway
async function fetchUserDataFromGateway(token: string | undefined) {
    try {
        const response = await fetch("http://gateway-api:7000/userData", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `token=${token}`, /// test wihout
            },
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user from Gateway: ${response.status} ${response.statusText}`);
        }

        // console.log(response);
        return await response.json();
    } catch (error) {
        console.error("❌ Error fetching user from Gateway:", error);
        return null;
    }
}

// Route: Check or Create User
gamefast.get("/get-user-data", async (request, reply) => {
    const token: string | undefined = request.cookies.token;

    console.log(`📌 Received GET /get-user-data request`);
    console.log(`🔍 Token from cookies:`, token);

    if (!token) {
        console.log("❌ No token provided.");
        return reply.status(401).send({ error: "No token provided" });
    }

    const userData = await fetchUserDataFromGateway(token);

    console.log("📌 Received user data from Gateway:", userData);

    if (!userData) {
        console.log("❌ Failed to fetch user from Gateway.");
        return reply.status(401).send({ error: "Failed to fetch user from Gateway" });
    }

    const { username, userId } = userData;
    console.log(`🔍 Checking user in DB: ${username} (ID: ${userId})`);

    const getUserFromDb = () =>
        new Promise((resolve, reject) => {
            db_game.get("SELECT * FROM users WHERE user_id = ?", [userId], (err, row) => {
                if (err) {
                    console.error("❌ Database error:", err.message);
                    return reject({ status: 500, error: "Database error", details: err.message });
                }
                resolve(row);
            });
        });

    try {
        let row = await getUserFromDb();

        if (!row) {
            console.log(`🆕 User '${username}' not found. Creating...`);
            // Insert new user with Promise FFFFFFFFFFDDDDDDDXXXXXXXXXXXXXXX
            await new Promise((resolve, reject) => {
                db_game.run(
                    "INSERT INTO users (user_id, user_name, user_set_dificulty, user_set_tableSize, user_set_sound) VALUES (?, ?, 'normal', 'medium', 1)",
                    [userId, username],
                    function (err) {
                        if (err) {
                            console.error("❌ Error inserting user:", err.message);
                            return reject({ status: 500, error: "Database error" });
                        }
                        console.log(`✅ New user '${username}' created.`);
                        resolve(null);
                    }
                );
            });
            row = {
                user_id: userId,
                user_name: username,
                user_set_dificulty: "normal",
                user_set_tableSize: "medium",
                user_set_sound: 1,
            };
        }
        console.log(`✅ User '${username}' found, sending settings.`);
        console.log("📌 Sending user data:", row);
        return reply.send(row);

    } catch (err: any) {
        return reply.status(err.status || 500).send({ error: err.error || "❌ Unknown error" });
    }
});

interface SaveSettingsRequest {
    Body: {
        username: string;
        difficulty: string;
        tableSize: string;
        sound: number;
    };
}

// Route: Save user settings
gamefast.patch<SaveSettingsRequest>("/save-settings", async (request, reply) => {
    const { username, difficulty, tableSize, sound } = request.body;

    if (!username) {
        return reply.status(400).send({ error: "Username is required" });
    }
    console.log(`🔄 Updating settings for ${username}`);

    try {
        await new Promise<void>((resolve, reject) => {
            db_game.run(
                `UPDATE users SET 
                    user_set_dificulty = ?, 
                    user_set_tableSize = ?, 
                    user_set_sound = ?
                 WHERE user_name = ?`,
                [difficulty, tableSize, sound, username],
                function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
        console.log(`✅ Settings successfully updated for ${username}`);
        reply.send({ message: "✅ Settings updated successfully!" });

    } catch (error) {
        reply.status(500).send({ error: "Database error", details: error instanceof Error ? error.message : "Unknown error" });
        console.error("❌ Database error:");
    }
});

// Function to Send Match Data to Main API
async function sendMatchToAPI(matchData: any) {
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

interface SaveMatchRequest {
    Body: {
        player1Id: number;
        player2Id: number;
        player1Score: number;
        player2Score: number;
        gameMode: string;
        winnerId: number;
    };
}

// Save match and Send to API
gamefast.post<SaveMatchRequest>("/save-match", async (request, reply) => {
    const { gameMode, player1Id, player2Id, player1Score, player2Score, winnerId } = request.body;
    if (!player1Id || !player2Id) return reply.status(400).send({ error: "Missing player IDs" });

    db_game.run(
        `INSERT INTO games (game_mode, game_player1_id, game_player2_id, game_player1_score, game_player2_score, game_winner) VALUES (?, ?, ?, ?, ?, ?)`,
        [gameMode, player1Id, player2Id, player1Score, player2Score, winnerId],
        async function (err) {
            if (err) return reply.status(500).send({ error: "Database error", details: err.message });

            const matchData = { matchId: this.lastID, gameMode, player1Id, player2Id, player1Score, player2Score, winnerId };

            console.log("📡 Sending match data to API:", matchData);
            const success = await sendMatchToAPI(matchData);

            reply.send({ message: success ? "✅ Match saved & sent!" : "⚠ Match saved, but API sync failed.", matchId: this.lastID });
        }
    );
});

// Start the Server
const start = async () => {
    try {
        await gamefast.listen({ port: 5000, host: "0.0.0.0" });
        console.log("Server running at http://localhost:5000");
    } catch (err) {
        gamefast.log.error(err);
        process.exit(1);
    }
};

start();
