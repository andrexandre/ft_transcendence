import fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyCookie from "@fastify/cookie";
import cors from '@fastify/cors';
import { userRoutes } from "./userSet.js";
import { handleJoin, handleMove, handleDisconnect, startGameLoop } from "./gameServer.js";
import * as lobby from "./lobbyManager.js";

const PORT = 5000;
const gamefast = fastify({ logger: true });

await gamefast.register(fastifyWebsocket);
gamefast.register(fastifyCookie);
gamefast.register(userRoutes);
await gamefast.register(cors, {
	origin: ['http://127.0.0.1:5500'],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
	credentials: true,
});

gamefast.get("/ws", { websocket: true }, (conn, req) => {
	const socket = conn;

	socket.on("message", (raw: string) => {
		try {
			const data = JSON.parse(raw);
			if (data.type === "join") handleJoin(socket, data);
			else if (data.type === "move") handleMove(socket, data.direction);
		} catch (err) {
			console.error("❌ Invalid message:", raw);
		}
	});

	socket.on("close", () => handleDisconnect(socket));
});

gamefast.get("/lobbies", (_, reply) => {
	reply.send(lobby.listLobbies());
});

gamefast.post("/lobbies", async (req, reply) => {
	const { username, userId, mode, maxPlayers } = req.body as any;

	const newLobby = lobby.createLobby(username, userId, mode, maxPlayers);

	if (!newLobby) {
		return reply.status(400).send({ error: "User is already in a lobby" });
	}

	reply.send({ id: newLobby.id });
});

gamefast.post("/lobbies/:id/join", async (req, reply) => {
	const { username, userId } = req.body as any;
	const { id } = req.params as any;
	const updated = lobby.joinLobby(id, username, userId);
	if (!updated) return reply.status(400).send({ error: "Join failed" });
	reply.send(updated);
});

// Start game loop (for multiplayer game logic) // Del in front
startGameLoop();

gamefast.listen({ port: PORT, host: "0.0.0.0" }, () => {
	console.log(`🚀 Game server running on ws://localhost:${PORT}`);
});
