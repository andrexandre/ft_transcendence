// src/lobbyManager.ts
import crypto from 'crypto';

export interface UserData {
	username: string;
	userId: number;
}

type Player = {
	userId: number;
	username: string;
	socket: WebSocket;
	isHost: boolean;
	difficulty?: string;
};

type Lobby = {
	id: string;
	hostId: number;
	gameMode: string;
	gameId?: string;
	maxPlayers: number;
	status: "waiting" | "in-game";
	players: Player[];
};


const lobbies = new Map<string, Lobby>();

export function createLobby(socket: WebSocket, user: UserData, gameMode: string, maxPlayers: number, difficulty?: string) {
	const lobbyId = `lob-${crypto.randomUUID().slice(0, 8)}`;
	// console.log("🛠️🛠️🛠️ Dif:", difficulty);

	const player: Player = {
		userId: user.userId,
		username: user.username,
		socket,
		isHost: true,
		difficulty //: difficulty
	};

	const lobby: Lobby = {
		id: lobbyId,
		hostId: user.userId,
		gameMode,
		maxPlayers,
		players: [player],
		status: "waiting"
	};

	lobbies.set(lobbyId, lobby);
	console.log(`🎮 Lobby criado: ${lobbyId}, Host: ${user.username} (ID: ${user.userId})`);
	console.log(`👥 Jogadores no lobby: [${lobby.players.map(p => `${p.username} (${p.isHost ? "Host" : "Guest"})`).join(", ")}]`);
	return lobbyId;
}

export function joinLobby(lobbyId: string, socket: WebSocket, user: UserData): string | null {
	const lobby = lobbies.get(lobbyId);
	if (!lobby || lobby.players.length >= lobby.maxPlayers || lobby.status !== "waiting") return null;

	const player: Player = {
		userId: user.userId,
		username: user.username,
		socket,
		isHost: false
	};

	lobby.players.push(player);
	console.log(`✅ ${user.username} (ID: ${user.userId}) joined lobby ${lobbyId}`);
	console.log(`👥 Jogadores no lobby: [${lobby.players.map(p => `${p.username} (${p.isHost ? "Host" : "Guest"})`).join(", ")}]`);
	return lobbyId;
}

export function startGame(lobbyId: string, requesterId: number): { success: boolean; gameId?: string } {
	console.log("🎯 Trying to start game:", "  Lobby ID:", lobbyId, "  Requester ID:", requesterId);
	const lobby = lobbies.get(lobbyId);

	if (!lobby) return { success: false };
	if ((Number(lobby.hostId) !== Number(requesterId))) return { success: false };
	if (lobby.players.length !== lobby.maxPlayers) return { success: false };

	lobby.status = "in-game";
	const gameId = `mat-${crypto.randomUUID().slice(0, 8)}`;
	lobby.gameId = gameId;

	console.log(`🚀 Starting game ${gameId} from lobby ${lobbyId}`);

	// changed
	lobby.players.forEach((player, index) => {
		const role = `p${index}`;
		const opponent = (lobby.maxPlayers === 2)
			? lobby.players.find(p => p.userId !== player.userId)?.username || "BoTony"
			: "MTC";
	
		if (player.socket.readyState === WebSocket.OPEN) {
			player.socket.send(JSON.stringify({
				type: "match-start",
				playerRole: role,
				opponent,
				gameMode: lobby.gameMode,
				gameId,
			}));
			console.log("✅ game-start enviado para o frontend.");
		} else {
			console.warn(`⚠️ Socket do jogador ${player.username} não está aberto!`);
		}
	});
	return { success: true, gameId };
}

export function listLobbies() { /// verificar erro aqui
  const result: any[] = [];
  for (const [id, lobby] of lobbies.entries()) {
    if (lobby.status === "waiting") {
      result.push({
        id,
        host: lobby.players.find(p => p.isHost)?.username || "???",
        hostUserId: lobby.hostId,
        playerCount: lobby.players.length,
        maxPlayers: lobby.maxPlayers,
        gameMode: lobby.gameMode,
		// players: lobby.players ///_
      });
    }
  }
  return result;
}

export function leaveLobby(userId: number): boolean {
	for (const [id, lobby] of lobbies.entries()) {
		const index = lobby.players.findIndex(p => p.userId === userId);
		if (index !== -1) {
			const leavingUser = lobby.players[index];
			if (leavingUser.isHost) {
				lobbies.delete(id);
				console.log(`🗑️ Lobby ${id} removido (host ${leavingUser.username} saiu)`);
			} else {
				lobby.players.splice(index, 1);
				console.log(`👋 Jogador ${leavingUser.username} saiu do lobby ${id}`);
				console.log(`👥 Jogadores restantes no lobby: [${lobby.players.map(p => p.username).join(", ")}]`);
			}
			return true;
		}
	}
	return false;
}

export function getLobbyByLobbyId(lobbyId: string): Lobby | null {
	return lobbies.get(lobbyId) || null;
  }

export function getLobbyByUserId(userId: number): Lobby | null {
  for (const lobby of lobbies.values()) {
    if (lobby.players.find(p => p.userId === userId)) return lobby;
  }
  return null;
}

export function getLobbyByGameId(gameId: string): Lobby | null {
  for (const lobby of lobbies.values()) {
    if (lobby.gameId === gameId) return lobby;
  }
  return null;
}

export function getLobbyBySocket(socket: WebSocket): Lobby | null {
  for (const lobby of lobbies.values()) {
    if (lobby.players.some(p => p.socket === socket)) {
      return lobby;
    }
  }
  return null;
}

export function removeLobbyByGameId(gameId: string) {
	for (const [lobbyId, lobby] of lobbies.entries()) {
	  if (lobby.gameId === gameId) {
		// Limpar referências a sockets (opcional mas útil para GC)
		lobby.players.forEach(player => {
		  try {
			if (player.socket.readyState === WebSocket.OPEN) {
			  player.socket.send(JSON.stringify({ type: "left-lobby", reason: "game-ended" }));
			}
			// fechar a conexão player.socket.close();
		  } catch (err) {
			console.warn(`⚠️ Erro ao tentar notificar ${player.username} que o lobby foi removido`);
		  }
		});
  
		// Remove o lobby
		lobbies.delete(lobbyId);
		console.log(`🗑️ Lobby ${lobbyId} removido após o jogo ${gameId}`);
		return;
	  }
	}
  
	console.warn(`⚠️ Nenhum lobby encontrado com gameId ${gameId} para remoção`);
  }
  