import fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyStatic from "@fastify/static";
import fastifyCookie from "@fastify/cookie";
import path from "path";
import db_game from "./db_game.js";


const gamefast = fastify({ logger: true });

gamefast.register(fastifyWebsocket);
gamefast.register(fastifyCookie);

gamefast.register(fastifyStatic, {
  root: path.join(process.cwd(), "public"),
  prefix: "/",
});

gamefast.get("/ws", { websocket: true }, (connection, req) => {
  console.log("Player connected");

  connection.socket.on("message", (message: string) => {
    console.log("Received:", message);
    connection.socket.send("Pong: " + message);
  });

  connection.socket.on("close", () => {
    console.log("Player disconnected");
  });
});

// API Route to Add User
gamefast.post("/add-user", async (request, reply) => {
  const user_name = request.cookies.username;

  if (!user_name) {
    return reply.status(400).send({ error: "Name is required" });
  }

  db_game.run("INSERT INTO users (user_name) VALUES (?)", [user_name], function (err) {
    if (err) {
        return reply.status(500).send({ error: "Database error", details: err.message });
    }
    reply.send({ message: "✅ User added", userId: this.lastID });
  });
});

// Serve `index.html`
gamefast.get("/", async (request, reply) => {
  return reply.sendFile("index.html");
});

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
