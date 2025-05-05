// src/server.ts
import Fastify from "fastify";
import fastifyWebsocket from '@fastify/websocket';
import fastifyCookie from "@fastify/cookie";
import cors from '@fastify/cors';
import { createLobby, joinLobby, startGame, listLobbies, leaveLobby, getLobbyByUserId, getLobbyBySocket } from './lobbyManager.js';
import { getUserDatafGateway, userRoutes } from './userSet.js';
import { handleMatchConnection } from './matchManager.js';

const PORT = 5000;
const gameserver = Fastify({ logger: true });

await gameserver.register(fastifyWebsocket);
await gameserver.register(fastifyCookie);
await userRoutes(gameserver);
await gameserver.register(cors, {
	origin: ['http://127.0.0.1:5500'],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
	credentials: true,
});

// LOBBY WS
gameserver.get('/game-ws', { websocket: true }, async (connection, req) => {
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

		console.log(`🔌 Connected: ${user.username} (${user.userId})`);
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
			console.log(`❌ Disconnected: ${user.username}`);
		});
	} catch (err) {
		console.error("Erro ao processar conexão WebSocket:", err);
		connection.send(JSON.stringify({ type: "error", message: "Server error" }));
		connection.close();
	}
});

gameserver.get('/lobbies', async (request, reply) => {
	const lobbies = listLobbies();
	reply.send(lobbies);
});

function handleSocketMessage(connection: any, data: any) {
	const user = connection.user;
	if (!user) {
		connection.send(JSON.stringify({ type: "error", message: "User not authenticated" }));
		return;
	}

	switch (data.type) {
		case "create-lobby": {
			if (getLobbyBySocket(user.socket)) {
				connection.send(JSON.stringify({ type: "error", message: "Já estás num lobby" }));
				return;
			}
			const { gameMode, maxPlayers } = data;
			if (!gameMode || !maxPlayers) {
				connection.send(JSON.stringify({ type: "error", message: "Missing lobby info" }));
				return;
			}
			const lobbyId = createLobby(connection, connection.user, gameMode, maxPlayers);
			connection.send(JSON.stringify({ type: "lobby-created", lobbyId, maxPlayers }));
			break;
		}
		case "lobby-message": {
			const lobby = getLobbyByUserId(user.userId);
			if (!lobby) {
				connection.send(JSON.stringify({ type: "error", message: "You're not in a lobby" }));
				return;
			}
			const payload = {
				type: "lobby-message",
				from: user.username,
				userId: user.userId,
				text: data.text
			};
			for (const player of lobby.players) {
				if (player.socket.readyState === 1) {
					player.socket.send(JSON.stringify(payload));
				}
			}
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
			const { success, gameId } = startGame(data.lobbyId, data.requesterId);
			if (!success) {
				connection.send(JSON.stringify({ type: "error", message: "Start not allowed" }));
			} else {
				const lobby = getLobbyByUserId(user.userId);
				if (lobby) {
					lobby.players.forEach((player, index) => {
						player.socket.send(JSON.stringify({
							type: "game-start",
							playerRole: index === 0 ? "left" : "right",
							opponent: lobby.players.length > 1 ? lobby.players[1 - index].username : "BoTony",
							gameId
						}));
					});
				}
			}
			break;
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
	const gameId = new URL(req.url!, 'http://127.0.0.1:').searchParams.get('gameId');
	if (!gameId) {
		connection.send(JSON.stringify({ type: "error", message: "Missing gameId" }));
		connection.close();
		return;
	}
	handleMatchConnection(gameId, connection);
});

// SERVER LISTENING
gameserver.listen({ port: PORT, host: "0.0.0.0" }, () => {
	console.log(`🚀 Game server running on ws://127.0.0.1:${PORT}`);
});
