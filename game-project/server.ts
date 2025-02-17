import fastify from "fastify";
import fastifyRequest from "fastify";
import fastifyReply from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyStatic from "@fastify/static";
import path from "path";

const gamefast = fastify({ logger: true });

// Register WebSocket Plugin
gamefast.register(fastifyWebsocket);

// Register Static Files
gamefast.register(fastifyStatic, {
  root: path.join(process.cwd(), "public"),
  prefix: "/",
});

// WebSocket Route
gamefast.get("/ws", { websocket: true }, (connection: any, req: any) => { // ✅ Fix types
  console.log("Player connected");

  connection.socket.on("message", (message: string) => {
    console.log("Received:", message);
    connection.socket.send("Pong: " + message);
  });

  connection.socket.on("close", () => {
    console.log("Player disconnected");
  });
});

// Serve `index.html`
gamefast.get("/", async (request: any, reply: any) => {
  return reply.sendFile("index.html");
});

// Start Server
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
