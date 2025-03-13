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
gamefast.register(fastifyJwt, { secret: "supersecret" });  // ✅ Register JWT plugin


// ✅ Fetch user data from Gateway (127.0.0.1:7000/userData)
async function fetchUserDataFromGateway(token: string | undefined) {
    try {
        
        const response = await fetch("http://gateway-api:7000/userData", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `token=${token}`,  // ✅ Forward cookies to the other server
            },
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user from Gateway: ${response.status} ${response.statusText}`);
        }
        // const { username, userId } = response.body;
        console.log(response);
        // console.log( await response.json());
        return await response.json(); // ✅ Return user data from Gateway
    } catch (error) {
        console.error("❌ Error fetching user from Gateway:", error);
        return null;
    }
}


// ✅ Route: Check or Create User
gamefast.get("/get-user-data", async (request, reply) => {
    // const authHeader = request.headers.authorization;
    // if (!authHeader) {
    //     return reply.status(401).send({ error: "Unauthorized: No token provided" });
    // }

    // const token = authHeader.split(" ")[1]; // ✅ Extract token from `Bearer <token>`
    const token: string | undefined = request.cookies.token;
    const userData = await fetchUserDataFromGateway(token); // ✅ Fetch from Gateway


    console.log(userData);
    if (!userData) {
        return reply.status(401).send({ error: "Failed to fetch user from Gateway" });
    }

    const { username, userId } = userData;
    console.log(`🔍 Checking user: ${username} (ID: ${userId})`);


    db_game.get("SELECT * FROM users WHERE user_id = ?", [userId], (err, row) => {
        if (err) {
            return reply.status(500).send({ error: "Database error", details: err.message });
        }

        if (!row) {
            console.log(`🆕 User '${username}' not found. Creating...`);
            db_game.run(
                "INSERT INTO users (user_id, user_name, user_set_dificulty, user_set_tableSize, user_set_sound) VALUES (?, ?, 'normal', 'medium', 1)",
                [userId, username],
                function (err) {
                    if (err) {
                        return reply.status(500).send({ error: "Database error" });
                    }

                    console.log(`✅ New user '${username}' created.`);
                    return reply.send({
                        user_id: userId,
                        user_name: username,
                        user_set_dificulty: "normal",
                        user_set_tableSize: "medium",
                        user_set_sound: 1,
                    });
                }
            );
            return; // ✅ Prevents multiple `reply.send()` calls
        }

        console.log(`✅ User '${username}' found, sending settings.`);
        reply.send(row);
    });
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
