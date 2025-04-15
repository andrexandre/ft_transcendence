import { WebSocket } from 'ws';
import crypto from 'crypto';

type Player = {
	id: string;             // internal socket id
	socket: WebSocket;
	username: string;
	userId: number;
};


type Lobby = {
  id: string;
  players: Player[];
};

const lobbies = new Map<string, Lobby>();

export function createLobby(socket: WebSocket, user: UserData): string {
	const lobbyId = crypto.randomUUID();
	const playerId = crypto.randomUUID();

	const lobby: Lobby = {
		id: lobbyId,
		players: [{
			id: playerId,
			socket,
			username: user.username,
			userId: user.userId
		}]
	};

	lobbies.set(lobbyId, lobby);
	return lobbyId;
}

export function joinLobby(lobbyId: string, socket: WebSocket): string | null {
  const lobby = lobbies.get(lobbyId);
  if (!lobby || lobby.players.length >= 2) return null;

  const playerId = crypto.randomUUID();
  lobby.players.push({ id: playerId, socket });

  if (lobby.players.length === 2) {
    startGame(lobby);
  }

  return playerId;
}

function startGame(lobby: Lobby) {
  console.log(`🎮 Starting game in lobby ${lobby.id}`);

  lobby.players.forEach((player, index) => {
    player.socket.send(
      JSON.stringify({
        type: 'game-start',
        player: index === 0 ? 'left' : 'right'
      })
    );
  });

  // TODO: You’ll move to real gameManager logic here later.
}
