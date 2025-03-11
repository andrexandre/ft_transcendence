import fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyStatic from "@fastify/static";
import fastifyCookie from "@fastify/cookie";
import path from "path";
import db_game from "./db_game.js";

const gamefast = fastify({ logger: true });

gamefast.register(fastifyWebsocket);
gamefast.register(fastifyCookie, {
    secret: "supersecret",
    parseOptions: {},
});
gamefast.register(fastifyStatic, {
    root: path.join(process.cwd(), "public"),
    prefix: "/",
});

// ✅ Get or Create User & Send Settings
gamefast.get("/get-user", async (request, reply) => {
    const username = request.cookies.username;
    
    console.log(`🔍 Checking user: ${username}`);

    if (!username) {
        return reply.status(400).send({ error: "No username found in cookies" });
    }

    db_game.get("SELECT * FROM users WHERE user_name = ?", [username], (err, row) => {
        if (err) {
            return reply.status(500).send({ error: "Database error", details: err.message });
        }

        if (!row) {
            console.log(`🆕 User '${username}' not found. Creating...`);
            db_game.run(
                "INSERT INTO users (user_name, user_set_dificulty, user_set_tableSize, user_set_sound) VALUES (?, 'normal', 'medium', 1)",
                [username],
                function (err) {
                    if (err) {
                        return reply.status(500).send({ error: "Database error" });
                    }

                    console.log(`✅ New user '${username}' created.`);
                    return reply.send({ 
                        user_name: username, 
                        user_set_dificulty: "normal", 
                        user_set_tableSize: "medium", 
                        user_set_sound: 1 
                    });
                }
            );
            return; // 🔴 FIX: Ensure we don't send two replies!
        } 

        console.log(`✅ User '${username}' found, sending settings.`);
        return reply.send(row); // 🔴 FIX: Add `return` to prevent multiple responses
    });
});




interface SaveSettingsRequest {
    Body: {
        username: string;
        difficulty: string;
        tableSize: string;
        sound: number;
    };
}
// ✅ Save Settings (Update DB)
gamefast.post<SaveSettingsRequest>("/save-settings", async (request, reply) => {
    const { username, difficulty, tableSize, sound } = request.body;

    if (!username) {
        return reply.status(400).send({ error: "Username is required" });
    }

    console.log(`🔄 Updating settings for ${username}`);

    db_game.run(
        `UPDATE users SET 
            user_set_dificulty = ?, 
            user_set_tableSize = ?, 
            user_set_sound = ?
         WHERE user_name = ?`,
        [difficulty, tableSize, sound, username],
        function (err) {
            if (err) {
                return reply.status(500).send({ error: "Database error", details: err.message });
            }
            reply.send({ message: "✅ Settings updated successfully!" });
        }
    );
});

// ✅ Serve `index.html`
gamefast.get("/", async (request, reply) => {
    return reply.sendFile("index.html");
});

// ✅ Start the Server
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
