// src/matchManager.ts
import { getGamePlayers } from './lobbyManager.js';

const matchSockets = new Map<string, WebSocket[]>();

export function handleMatchConnection(gameId: any, connection: any) {
	const players = getGamePlayers(gameId);
	if (!players) {
		console.log(`❌ Game ID not found: ${gameId}`);
		connection.socket.send(JSON.stringify({ type: "error", message: "Game not found" }));
		connection.socket.close();
		return;
	}

	console.log(`🔗 Nova ligação de jogador no gameId ${gameId}`);
	if (!matchSockets.has(gameId)) {
		matchSockets.set(gameId, []);
		console.log(`🆕 Sala criada para jogo ${gameId}`);
	}

	matchSockets.get(gameId)!.push(connection);

	console.log(`👥 Total de sockets no jogo ${gameId}: ${matchSockets.get(gameId)!.length}`);

	connection.socket.on("message", (msg: string) => {
		try {
			const data = JSON.parse(msg.toString());
			console.log(`📨 [${gameId}] Msg recebida:`, data);

			// Broadcast para os outros jogadores
			for (const client of matchSockets.get(gameId)!) {
				if (client !== connection && client.readyState === connection.socket.OPEN) {
					client.send(JSON.stringify(data));
					console.log(`📤 [${gameId}] Reenviado para outro player`, data);
				}
			}
		} catch (err) {
			console.error("❌ Invalid message:", err);
			connection.socket.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
		}
	});

	connection.socket.on("close", () => {
		console.log(`❌ Player desconectado do jogo ${gameId}`);
		const remaining = matchSockets.get(gameId)?.filter(c => c !== connection);
		if (!remaining || remaining.length === 0) {
			matchSockets.delete(gameId);
			console.log(`🧹 Match ${gameId} limpo (todos os jogadores saíram)`);
		} else {
			matchSockets.set(gameId, remaining);
			console.log(`👥 Jogadores restantes: ${remaining.length}`);
		}
	});
}
