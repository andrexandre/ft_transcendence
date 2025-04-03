import fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt"
import cors from '@fastify/cors';
import { userRoutes } from "./userSet.js";

const UPDATE_INTERVAL = 1000 / 30; //change to 60 for 60 fps layter
const PORT = 5000;
const gamefast = fastify({ logger: true });

await gamefast.register(fastifyWebsocket);
gamefast.register(fastifyCookie);
gamefast.register(fastifyJwt, { secret: "supersecret" });
gamefast.register(userRoutes);
///////////////// The cors import and use is temporary /////////////
gamefast.register(cors, {
    origin: ['http://127.0.0.1:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
});
////////////////////////////////////////////////////////////////////

type Player = { id: string; username: string; position: number };
const clients = new Map<any, Player>();

let ball = { x: 400, y: 300, vx: 3, vy: 2 };


gamefast.get("/ws", { websocket: true }, (connection, req) => {
	const socket = connection;
	console.log("🧠🧠🧠", Object.getOwnPropertyNames(connection));
	console.log("🧠 /ws handler triggered | 🔌WebSocket connected");


	socket.on("message", (raw: string) => {
		try {
			const data = JSON.parse(raw.toString());
	
			if (data.type === "join") {
				if (clients.size >= 2) {
					socket.send(JSON.stringify({ type: "full" }));
					socket.close();
					return;
				}
				const player: Player = {
					id: `P${Math.random().toString(36).slice(2, 5)}`,
					username: data.username || "Guest",
					position: 50,
				};
				clients.set(socket, player);
				console.log(`✅ ${player.username} joined`);
	
				socket.send(JSON.stringify({ type: "welcome", playerId: player.id }));
			}
	
			if (data.type === "move") {
				const p = clients.get(socket);
				if (p) {
					if (data.direction === "up") p.position = Math.max(0, p.position - 5);
					if (data.direction === "down") p.position = Math.min(100, p.position + 5);
				}
			}
		} catch (e) {
			console.error("❌ Invalid message", e);
		}
	});
	
	socket.on("close", () => {
		clients.delete(socket);
		console.log("❌ Player disconnected");
	});
});

// Broadcast state
setInterval(() => {
	if (clients.size < 2) return;

	// Simple ball update
	ball.x += ball.vx;
	ball.y += ball.vy;

	if (ball.x <= 0 || ball.x >= 800 - 10) ball.vx *= -1;
	if (ball.y <= 0 || ball.y >= 600 - 10) ball.vy *= -1;

	const state = {
		players: Array.from(clients.values()),
		ball,
	};

	for (const [socket] of clients) {
		if (socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({ type: "update", state }));
		}
	}
	console.log("📤 Sending state to", clients.size, "clients");
	console.log("🎯 Ball:", ball.x, ball.y);

}, UPDATE_INTERVAL);

gamefast.listen({ port: PORT, host: "0.0.0.0" }, () => {
	console.log(`🚀 Game server running on ws://localhost:${PORT}`);
});