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

export function createLobby(socket: WebSocket, user: UserData, gameMode: string, maxPlayers: number): string {
  const lobbyId = `lob-${crypto.randomUUID().slice(0, 8)}`;

  const player: Player = {
    userId: user.userId,
    username: user.username,
    socket,
    isHost: true
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
  console.log(`🎮 Lobby criado: ${lobbyId}, Host: ${user.username}`);
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
  console.log(`✅ ${user.username} joined lobby ${lobbyId}`);
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

  lobby.players.forEach((player, index) => {
    if (player.socket.readyState === WebSocket.OPEN) {
      player.socket.send(JSON.stringify({
        type: "game-start",
        playerRole: index === 0 ? "left" : "right",
        opponent: lobby.players.length > 1 ? lobby.players[1 - index].username : "BoTony",
        gameId
      }));
      console.log("✅ game-start enviado para o frontend.");
    } else {
      console.warn(`⚠️ Socket do jogador ${player.username} não está aberto!`);
    }
  });

  return { success: true, gameId };
}

export function listLobbies() {
  const result: any[] = [];
  for (const [id, lobby] of lobbies.entries()) {
    if (lobby.status === "waiting") {
      result.push({
        id,
        host: lobby.players.find(p => p.isHost)?.username || "???",
        hostUserId: lobby.hostId,
        playerCount: lobby.players.length,
        maxPlayers: lobby.maxPlayers,
        gameMode: lobby.gameMode
      });
    }
  }
  return result;
}

export function leaveLobby(userId: number): boolean {
  for (const [id, lobby] of lobbies.entries()) {
    const index = lobby.players.findIndex(p => p.userId === userId);
    if (index !== -1) {
      if (lobby.players[index].isHost) {
        lobbies.delete(id);
        console.log(`🗑️ Lobby ${id} removido (host saiu)`);
      } else {
        lobby.players.splice(index, 1);
        console.log(`👋 Jogador ${userId} saiu do lobby ${id}`);
      }
      return true;
    }
  }
  return false;
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

// export function getGamePlayers(gameId: string) {
//   for (const lobby of lobbies.values()) {
//     if (lobby.gameId === gameId) return lobby.players;
//   }
//   return null;
// }

export function removeLobbyByGameId(gameId: string) {
  for (const [id, lobby] of lobbies.entries()) {
    if (lobby.gameId === gameId) {
      lobbies.delete(id);
      console.log(`🗑️ Lobby ${id} removido após fim do jogo`);
      return;
    }
  }
}
