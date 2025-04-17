// src/matchManager.ts
import { WebSocket } from 'ws';
import { getGamePlayers } from './lobbyManager.js';

const matchSockets = new Map<string, WebSocket[]>();
// const ongoingGames = new Map<string, Player[]>();

export function handleMatchConnection(gameId: string, socket: WebSocket) {
	// const players = ongoingGames.get(gameId);
	const players = getGamePlayers(gameId);
	if (!players) {
		console.log(`❌ Game ID not found: ${gameId}`);
		socket.send(JSON.stringify({ type: "error", message: "Game not found" }));
		socket.close();
		return;
	}

	console.log(`🔗 Nova ligação de jogador no gameId ${gameId}`);
	if (!matchSockets.has(gameId)) {
		matchSockets.set(gameId, []);
		console.log(`🆕 Sala criada para jogo ${gameId}`);
	}

	matchSockets.get(gameId)!.push(socket);

	console.log(`👥 Total de sockets no jogo ${gameId}: ${matchSockets.get(gameId)!.length}`);

	socket.on("message", (msg) => {
		try {
			const data = JSON.parse(msg.toString());
			console.log(`📨 [${gameId}] Msg recebida:`, data);

			// Broadcast para os outros jogadores
			for (const client of matchSockets.get(gameId)!) {
				if (client !== socket && client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify(data));
					console.log(`📤 [${gameId}] Reenviado para outro player`, data);
				}
			}
		} catch (err) {
			console.error("❌ Invalid message:", err);
			socket.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
		}
	});

	socket.on("close", () => {
		console.log(`❌ Player desconectado do jogo ${gameId}`);
		const remaining = matchSockets.get(gameId)?.filter(s => s !== socket);
		if (!remaining || remaining.length === 0) {
			matchSockets.delete(gameId);
			console.log(`🧹 Match ${gameId} limpo (todos os jogadores saíram)`);
		} else {
			matchSockets.set(gameId, remaining);
			console.log(`👥 Jogadores restantes: ${remaining.length}`);
		}
	});
}
