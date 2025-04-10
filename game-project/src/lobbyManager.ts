// import { FastifyInstance } from "fastify";
type Lobby = {
	id: string;
	hostUsername: string;
	hostUserId: number;
	players: { username: string; userId: number }[];
	mode: string;
	maxPlayers: number;
};

const lobbies = new Map<string, Lobby>();

export function listLobbies(): Lobby[] {
	return [...lobbies.values()];
}

export function createLobby(username: string, userId: number, mode: string, maxPlayers: number): Lobby {
	const id = Math.random().toString(36).slice(2, 6);
	const lobby: Lobby = {
		id,
		hostUsername: username,
		hostUserId: userId,
		mode,
		maxPlayers,
		players: [{ username, userId }],
	};
	lobbies.set(id, lobby);
	return lobby;
}

export function joinLobby(id: string, username: string, userId: number): Lobby | null {
	const lobby = lobbies.get(id);
	if (!lobby || lobby.players.length >= lobby.maxPlayers) return null;
	lobby.players.push({ username, userId });
	return lobby;
}



// infos
// Lobby model    Defines lobby schema
// lobbies Map	  Holds all active lobbies
// createLobby()	Generates new lobbies
// joinLobby()	  Allows players to enter
// leaveLobby()	  Handles exits/disbands
// lobbyRoutes()	Exposes HTTP API