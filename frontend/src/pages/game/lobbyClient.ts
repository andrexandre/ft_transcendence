const API_URL = "http://127.0.0.1:5000";

export async function fetchLobbies() {
	const res = await fetch(`${API_URL}/lobbies`);
	if (!res.ok) throw new Error("Failed to fetch lobbies");
	return await res.json();
}

export async function createLobby(username: string, userId: number, mode = "classic", maxPlayers = 2) {
	const res = await fetch(`${API_URL}/lobbies`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username, userId, mode, maxPlayers }),
	});
	if (!res.ok) throw new Error("Failed to create lobby");
	return await res.json();
}

export async function joinLobby(lobbyId: string, username: string, userId: number) {
	const res = await fetch(`${API_URL}/lobbies/${lobbyId}/join`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username, userId }),
	});
	if (!res.ok) throw new Error("Failed to join lobby");
	return await res.json();
}
