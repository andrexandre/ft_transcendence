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

export function findLobbyByUserId(userId: number): Lobby | undefined {
	for (const lobby of lobbies.values()) {
		if (lobby.hostUserId === userId) return lobby;
		if (lobby.players.some(p => p.userId === userId)) return lobby;
	}
	return undefined;
}


export function createLobby(username: string, userId: number, mode: string, maxPlayers: number): Lobby | null {
	if (findLobbyByUserId(userId)) {
		console.log(`❌ User ${userId} already in a lobby, cannot host`);
		return null;
	}

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

export function joinLobby(lobbyId: string, username: string, userId: number): Lobby | null {
	const lobby = lobbies.get(lobbyId);
	if (!lobby) return null;

	if (findLobbyByUserId(userId)) {
		console.log(`❌ User ${userId} already in a lobby, cannot join another`);
		return null;
	}

	if (lobby.players.length >= lobby.maxPlayers) {
		console.log(`⚠ Lobby ${lobbyId} is full`);
		return null;
	}

	lobby.players.push({ username, userId });
	return lobby;
}

export function leaveLobby(lobbyId: string, userId: number): boolean {
	const lobby = lobbies.get(lobbyId);
	if (!lobby) return false;

	lobby.players = lobby.players.filter(p => p.userId !== userId);
	if (lobby.players.length === 0) {
		lobbies.delete(lobbyId);
	}
	return true;
}

export function removeLobbyIfHost(lobbyId: string, userId: number): boolean {
	const lobby = lobbies.get(lobbyId);
	if (!lobby || lobby.hostUserId !== userId) return false;

	lobbies.delete(lobbyId);
	return true;
}

export function findLobbyById(id: string): Lobby | undefined {
	return lobbies.get(id);
}

export function removeLobby(id: string): boolean {
	return lobbies.delete(id);
}
