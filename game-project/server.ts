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

// ✅ Define Fastify request type for query parameters
interface GetUserRequest {
    Querystring: {
        username: string;
    };
}

// ✅ Get or Create User (Fixed)
gamefast.get<GetUserRequest>("/get-user", async (request, reply) => {
    const { username } = request.query;
    
    console.log(`🔍 Checking username in db_game: ${username}`);

    if (!username) {
        return reply.status(400).send({ error: "No username provided" });
    }

    db_game.get(
        "SELECT user_name FROM users WHERE user_name = ?",
        [username],
        (err, row) => {
            if (err) {
                console.error("❌ Database Error:", err.message);
                return reply.status(500).send({ error: "Database error", details: err.message });
            }
            if (!row) {
                console.log(`🆕 User '${username}' not found. Creating...`);
                db_game.run("INSERT INTO users (user_name) VALUES (?)", [username], (err) => {
                    if (err) return reply.status(500).send({ error: "Database error" });
                    console.log(`✅ User '${username}' created in db_game.`);
                    return reply.send({ exists: false }); // User was created
                });
            } else {
                console.log(`✅ User '${username}' already exists in db_game.`);
                reply.send({ exists: true }); // User exists
            }
        }
    );
});

// Serve `index.html`
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
