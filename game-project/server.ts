import fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyStatic from "@fastify/static";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt"
import path from "path";
import db_game from "./db_game.js";

const gamefast = fastify({ logger: true });

gamefast.register(fastifyWebsocket);
gamefast.register(fastifyCookie);
gamefast.register(fastifyStatic, {
    root: path.join(process.cwd(), "public"),
    prefix: "/",
});
gamefast.register(fastifyJwt, { secret: "supersecret" });

// Fetch user data from Gateway
async function fetchUserDataFromGateway(token: string | undefined) {
    try {
        const response = await fetch("http://gateway-api:7000/userData", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `token=${token}`,
            },
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user from Gateway: ${response.status} ${response.statusText}`);
        }

        console.log(response);
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
    // Use Promise to avoid multiple `reply.send()` calls FFFFFFFFFFDDDDDXXXXXXXXXXX
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

    } catch (err: unknown) {
        console.error("❌ Error processing user data:", err);
        if (err instanceof Error) {
            return reply.status(500).send({ error: err.message });
        } else {
            return reply.status(500).send({ error: "An unknown error occurred" });
        }
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

// Route: Save user settings (with Promises)
gamefast.post<SaveSettingsRequest>("/save-settings", async (request, reply) => {
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
        const errorMessage = error instanceof Error ? error.message : "Unknown database error";
        console.error("❌ Database error:", errorMessage);
        reply.status(500).send({ error: "Database error", details: errorMessage });
    }
});

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

gamefast.post<SaveMatchRequest>("/save-match", async (request, reply) => {
    const { player1Id, player2Id, player1Score, player2Score, gameMode, winnerId } = request.body;

    if (!player1Id || !player2Id || !gameMode) {
        return reply.status(400).send({ error: "Missing required match data" });
    }

    console.log(`📌 Saving match result: ${player1Id} vs ${player2Id}, Mode: ${gameMode}`);

    try {
        await new Promise<void>((resolve, reject) => {
            db_game.run(
                `INSERT INTO games 
                    (game_mode, game_player1_id, game_player2_id, game_player1_score, game_player2_score, game_winner) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [gameMode, player1Id, player2Id, player1Score, player2Score, winnerId],
                function (err) {
                    if (err) {
                        console.error("❌ Error saving match:", err.message);
                        reject(err);
                    } else {
                        console.log("✅ Match saved successfully!");
                        resolve();
                    }
                }
            );
        });

        reply.send({ message: "Match saved successfully!" });

    } catch (error) {
        console.error("❌ Database error:", error);
        reply.status(500).send({ error: "Database error" });
    }
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
