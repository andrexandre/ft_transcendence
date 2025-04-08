import fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt"
import { userRoutes } from "./userSet.js";


const UPDATE_INTERVAL = 1000 / 60;
const PORT = 5000;
const gamefast = fastify({ logger: true });

gamefast.register(fastifyWebsocket);
gamefast.register(fastifyCookie);
gamefast.register(fastifyJwt, { secret: "supersecret" });
gamefast.register(userRoutes);
///////////////// The cors import and use is temporary /////////////
import cors from '@fastify/cors';
gamefast.register(cors, {
    origin: ['http://127.0.0.1:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
});
////////////////////////////////////////////////////////////////////

interface Player {
	id: string;
	username: string;
	position: number;
  }
const clients = new Map<WebSocket, Player>();

gamefast.get('/ws', { websocket: true }, (connection, req) => {
	const socket = connection.socket;
	console.log("🧠 WebSocket /ws handler triggered");
  
	socket.on('message', (message: string | Buffer) => {
		console.log("📩 Message received:", message.toString());
		const raw = message.toString();
		try {
			const data = JSON.parse(raw);
	
			if (data.type === "join") {
			const player: Player = {
				id: `Player-${Math.random().toString(36).slice(2, 6)}`,
				username: data.username ?? "Unknown",
				position: 50,
			};
	
			clients.set(socket, player);
			console.log(`✅ ${player.username} joined as ${player.id}`);
	
			socket.send(JSON.stringify({ type: "welcome", player }));
			}
	
			if (data.type === "move") {
			const player = clients.get(socket);
			if (player) {
				if (data.direction === "up") player.position = Math.max(0, player.position - 5);
				if (data.direction === "down") player.position = Math.min(100, player.position + 5);
			}
			}
	
		} catch (err) {
			console.error("❌ Failed to parse message:", raw);
		}
		});
	
		socket.on("close", () => {
		const player = clients.get(socket);
		if (player) {
			console.log(`❌ ${player.username} (${player.id}) disconnected`);
		}
		clients.delete(socket);
		});
});

  setInterval(() => {
	const state = Array.from(clients.values());
	for (const [socket] of clients) {
	  if (socket.readyState === socket.OPEN) {
		socket.send(JSON.stringify({ type: "update", state }));
	  }
	}
  }, UPDATE_INTERVAL);

// Start server
gamefast.listen({ port: PORT, host: "0.0.0.0" }, () => {
	console.log(`🚀 Multiplayer server running on ws://localhost:${PORT}`);
  });