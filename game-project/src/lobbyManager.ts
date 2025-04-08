// import { FastifyInstance } from "fastify";

// export const lobbies = new Map<string, Lobby>();

// export interface Lobby {
// 	id: string;
// 	hostUserId: number;
// 	hostUsername: string;
// 	mode: "classic" | "tournament";
// 	maxPlayers: number;
// 	players: { userId: number; username: string }[];
// 	status: "waiting" | "in-game";
// 	createdAt: number;
// }

// export function createLobby(hostUserId: number, hostUsername: string, mode: Lobby["mode"], maxPlayers = 2): Lobby {
// 	const id = `lobby-${Math.random().toString(36).slice(2, 6)}`;
// 	const lobby: Lobby = {
// 		id,
// 		hostUserId,
// 		hostUsername,
// 		mode,
// 		maxPlayers,
// 		players: [{ userId: hostUserId, username: hostUsername }],
// 		status: "waiting",
// 		createdAt: Date.now()
// 	};
// 	lobbies.set(id, lobby);
// 	return lobby;
// }

// export function getLobby(id: string): Lobby | undefined {
// 	return lobbies.get(id);
// }

// export function joinLobby(lobbyId: string, userId: number, username: string): boolean {
// 	const lobby = lobbies.get(lobbyId);
// 	if (!lobby || lobby.players.length >= lobby.maxPlayers || lobby.status !== "waiting") return false;
// 	lobby.players.push({ userId, username });
// 	return true;
// }

// export function leaveLobby(lobbyId: string, userId: number) {
// 	const lobby = lobbies.get(lobbyId);
// 	if (!lobby) return;
// 	lobby.players = lobby.players.filter(p => p.userId !== userId);
// 	if (userId === lobby.hostUserId || lobby.players.length === 0) {
// 		lobbies.delete(lobbyId);
// 	}
// }

// export async function lobbyRoutes(fastify: FastifyInstance) {
// 	fastify.get("/lobbies", async () => {
// 		return Array.from(lobbies.values());
// 	});

// 	fastify.post("/lobbies", async (req, res) => {
// 		const { hostUserId, hostUsername, mode, maxPlayers } = req.body as any;
// 		if (!hostUserId || !hostUsername) return res.code(400).send({ error: "Missing host info" });
// 		const lobby = createLobby(hostUserId, hostUsername, mode, maxPlayers);
// 		return lobby;
// 	});

// 	fastify.post("/lobbies/:id/join", async (req, res) => {
// 		const { userId, username } = req.body as any;
// 		const { id } = req.params as any;
// 		if (!joinLobby(id, userId, username)) return res.code(400).send({ error: "Cannot join" });
// 		return { success: true };
// 	});

// 	fastify.post("/lobbies/:id/leave", async (req, res) => {
// 		const { userId } = req.body as any;
// 		const { id } = req.params as any;
// 		leaveLobby(id, userId);
// 		return { success: true };
// 	});
// }
