// src/server.ts
import Fastify from "fastify";
import fastifyWebsocket from '@fastify/websocket';
import fastifyCookie from "@fastify/cookie";
import { getLobbyByLobbyId, createLobby, joinLobby, startGame, listLobbies, leaveLobby, getLobbyByUserId} from './lobbyManager.js';
import { getUserById, getUserDatafGateway, userRoutes } from './userSet.js';
import { handleMatchConnection } from './matchManager.js';
import { createTournament } from "./tournamentManager.js";
import { Logger } from "./utils.js";
import type { UserData } from './lobbyManager.js';
import fs from 'fs';

const PORT = 5000;
const disconnectTimers = new Map<number, NodeJS.Timeout>();
const gameserver = Fastify({
	logger: false,
	https: {
		key: fs.readFileSync('/ssl/server.key'),
		cert: fs.readFileSync('/ssl/server.crt'),
	}
});
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

await gameserver.register(fastifyWebsocket);
await gameserver.register(fastifyCookie);
await gameserver.register(userRoutes, { prefix: '/game' });
// await gameserver.register(cors, {
// 	origin: ['http://127.0.0.1:5500', `http://${process.env.IP}:5500`, `http://nginx-gateway:80`],
// 	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
// 	credentials: true,
// });

// LOBBY WS
gameserver.get('/lobby-ws', { websocket: true }, async (connection, req) => {
	try {
		const token = req.cookies?.token;
		if (!token) {
			connection.send(JSON.stringify({ type: "error", message: "Missing token" }));
			connection.close();
			return;
		}
		const user = await getUserDatafGateway(token);
		if (!user) {
			connection.send(JSON.stringify({ type: "error", message: "Invalid token" }));
			connection.close();
			return;
		}

		Logger.log(`🔌 Connected: ${user.username} (${user.userId})`);
		(connection as any).user = user;

		connection.on('message', (msg) => {
			try {
				const data = JSON.parse(msg.toString());
				handleSocketMessage(connection, data);
			} catch (err) {
				connection.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
			}
		});

		connection.on('close', () => {
			if (!user) return;
			Logger.log(`⏳ ${user.username} desconectou. Timeout de 5s iniciado`);
			const timeout = setTimeout(() => {
				Logger.log(`❌ ${user.username} não voltou. A sair do lobby.`);
				leaveLobby(user.userId);
				disconnectTimers.delete(user.userId);
			}, 1000);
			disconnectTimers.set(user.userId, timeout);
		});
	} catch (err) {
		Logger.error("Erro ao processar conexão WebSocket:", err);
		connection.send(JSON.stringify({ type: "error", message: "Server error" }));
		connection.close();
	}
});

gameserver.get('/game/lobbies', async (request, reply) => {
	const lobbies = listLobbies();
	reply.send(lobbies);
});

async function handleSocketMessage(connection: any, data: any) {
	if (!connection.user) {
		connection.send(JSON.stringify({ type: "error", message: "User not authenticated" }));
		return;
	}
	
	const tmp:any = await getUserById(connection.user.userId);
	const user: UserData = {
		username: tmp.user_name,
		userId: tmp.user_id
	};

	switch (data.type) {
		case "create-lobby": {
			const { gameMode, maxPlayers } = data;
			if (!gameMode || !maxPlayers) {
				connection.send(JSON.stringify({
					type: "error",
					message: "Faltam dados para criar o lobby"
				}));
				return;
			}
			const lobbyId = createLobby(connection, user, gameMode, maxPlayers, data.difficulty);
			if (!lobbyId) {
				connection.send(JSON.stringify({
					type: "error",
					message: "Já estás noutro lobby!"
				}));
				return;
			}
			connection.send(JSON.stringify({
				type: "lobby-created",
				lobbyId,
				maxPlayers
			}));
			break;
		}

		case "join-lobby": {
			if (getLobbyByUserId(user.userId)) {
				connection.send(JSON.stringify({ type: "error", message: "Já estás num lobby" }));
				return;
			}
			const playerId = joinLobby(data.lobbyId, connection, user);
			if (playerId) {
				connection.send(JSON.stringify({ type: "lobby-joined", playerId }));
			} else {
				connection.send(JSON.stringify({ type: "error", message: "Unable to join lobby" }));
			}
			break;
		}
		
		case "start-game": {
			const lobby = getLobbyByLobbyId(data.lobbyId);
			if (lobby && lobby.gameMode !== "TNT") {
				const { success, gameId } = startGame(data.lobbyId, data.requesterId);
				if (!success) {
					connection.send(JSON.stringify({ type: "error", message: "Start not allowed" }));
				} 
				break;
			} else if (lobby && lobby.gameMode === "TNT"){
				createTournament(lobby?.id, lobby?.players);
			}
		}

		case "leave-lobby": {
			const left = leaveLobby(user.userId);
			if (left) {
				connection.send(JSON.stringify({ type: "left-lobby" }));
			} else {
				connection.send(JSON.stringify({ type: "error", message: "Not in a lobby" }));
			}
			break;
		}
		default:
			connection.send(JSON.stringify({ type: "error", message: "Unknown command" }));
	}
}

// MATCH WS
gameserver.get('/match-ws', { websocket: true }, (connection, req) => {
	const ws = connection as any;
	const query = new URL(req.url!, 'http://localhost').searchParams;

	const gameId = query.get('gameId');
	const userId = Number(query.get('userId'));
	const username = query.get('username');

	if (!gameId || !userId || !username) {
		ws.send(JSON.stringify({ type: "error", message: "Missing gameId or user" }));
		ws.close();
		return;
	}

	ws.user = { userId, username };
	handleMatchConnection(gameId, ws);
});


// SERVER LISTENING
gameserver.listen({ port: PORT, host: "0.0.0.0" }, () => {
	Logger.log(`🚀 Game server running on ws://127.0.0.1:${PORT}`);
});
