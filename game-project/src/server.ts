import fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import cors from '@fastify/cors';
import { userRoutes } from "./userSet.js";
import { handleJoin, handleMove, handleDisconnect, startGameLoop } from "./gameServer.js";

const PORT = 5000;
const gamefast = fastify({ logger: true });

await gamefast.register(fastifyWebsocket);
gamefast.register(fastifyCookie);
gamefast.register(fastifyJwt, { secret: "supersecret" });
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

// Start game loop (broadcast every frame)
startGameLoop();

gamefast.listen({ port: PORT, host: "0.0.0.0" }, () => {
	console.log(`🚀 Game server running on ws://localhost:${PORT}`);
});
