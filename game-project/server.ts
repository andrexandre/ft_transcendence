import fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyStatic from "@fastify/static";
import path from "path";
import sqlite3 from "sqlite3";

// Create or open SQLite database
const db = new sqlite3.Database("database.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

// Create users table if not exists
db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )`,
  (err) => {
    if (err) console.error("Error creating table:", err.message);
  }
);

const gamefast = fastify({ logger: true });

// Register WebSocket Plugin
gamefast.register(fastifyWebsocket);

// Register Static Files
gamefast.register(fastifyStatic, {
  root: path.join(process.cwd(), "public"),
  prefix: "/",
});

// WebSocket Route
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
  const { name } = request.body as { name: string };

  if (!name) {
    return reply.status(400).send({ error: "Name is required" });
  }

  db.run("INSERT INTO users (name) VALUES (?)", [name], function (err) {
    if (err) {
      return reply.status(500).send({ error: "Database error" });
    }
    reply.send({ message: "User added", userId: this.lastID });
  });
});

// API Route to Get All Users
gamefast.get("/users", async (request, reply) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      return reply.status(500).send({ error: "Database error" });
    }
    reply.send(rows);
  });
});

// Serve `index.html`
gamefast.get("/", async (request, reply) => {
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
