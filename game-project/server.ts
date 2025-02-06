import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyStatic from "@fastify/static";
import * as path from "path";

const fastify = Fastify({ logger: true });

// ✅ Register WebSocket Plugin
fastify.register(fastifyWebsocket);

// ✅ Register Static File Serving
fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

// ✅ WebSocket Route (MUST be registered before starting server)
fastify.get("/ws", { websocket: true }, (connection, req) => {
  console.log("Player connected");

  connection.socket.on("message", (message: string) => {
    console.log("Received:", message);
    connection.socket.send("Pong: " + message);
  });

  connection.socket.on("close", () => {
    console.log("Player disconnected");
  });
});

// ✅ Serve index.html
fastify.get("/", async (request, reply) => {
  return reply.sendFile("index.html");
});

// ✅ Start Server (Only start once!)
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Server running at http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
