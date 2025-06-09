// src/matchManager.ts
import { getLobbyByGameId, removeLobbyByGameId } from './lobbyManager.js';
import { Logger } from "./utils.js";
import { matches, matchSockets, initMatchState, startCountdown } from "./matchLogic.js";

export function handleMatchConnection(gameId: string, connection: any) {
	const lobby = getLobbyByGameId(gameId);
	if (!lobby) {
		Logger.log(`❌ Lobby not found for gameId: ${gameId}`);
		connection.send(JSON.stringify({ type: "error", message: "Lobby not found" }));
		connection.close();
		return;
	}

	const index = matchSockets.get(gameId)?.length || 0;

	if (!matchSockets.has(gameId)) {
		matchSockets.set(gameId, []);
		Logger.log(`🌟 Sala criada para jogo ${gameId}`);
	}
	matchSockets.get(gameId)!.push(connection);
	Logger.log(`👥 Total de sockets no jogo ${gameId}: ${matchSockets.get(gameId)!.length}`);

	if (!matches.has(gameId)) {
		const matchState = initMatchState(lobby, gameId);
		matches.set(gameId, matchState);
		startCountdown(gameId);
		Logger.log(`🧐 Estado inicial criado para jogo ${gameId}`);
	}

	const user = connection.user;
	if (user) {
		connection.send(JSON.stringify({
			type: "welcome",
			playerId: user.userId,
			username: user.username
		}));
	}

	connection.on("message", (msg: string) => {
		try {
			const data = JSON.parse(msg.toString());
			const match = matches.get(gameId);
			if (!match) return;

			const player = match.players[index];
			if (!player) return;

			if (data.type === "move") {
				if (data.direction === "up") {
					player.posiY = Math.max(0, player.posiY - 2);
				} else if (data.direction === "down") {
					player.posiY = Math.min(100, player.posiY + 2);
				}
			}
		} catch (err) {
			Logger.error("❌ Invalid message:", err);
			connection.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
		}
	});

	connection.on("close", () => {
		Logger.log(`❌ Player desconectado do jogo ${gameId}`);
		const sockets = matchSockets.get(gameId)?.filter((c) => c !== connection);
		if (!sockets || sockets.length === 0) {
			matchSockets.delete(gameId);
			const match = matches.get(gameId);
			if (match) clearInterval(match.interval);
			matches.delete(gameId);
			removeLobbyByGameId(gameId);
			Logger.log(`🧹 Match ${gameId} limpo (todos os jogadores saíram)`);
		} else {
			matchSockets.set(gameId, sockets);
			Logger.log(`👥 Jogadores restantes: ${sockets.length}`);
		}
	});
}
