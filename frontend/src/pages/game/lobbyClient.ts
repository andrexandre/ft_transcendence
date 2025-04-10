import { showToast } from "../../utils";

const SERVER_URL = "http://127.0.0.1:5000";

export async function renderLobbyList(): Promise<void> {
	try {
		const lobbies = await fetchLobbies();
		const list = document.getElementById('lobby-list')!;
		list.innerHTML = "";

		const currentUsername = sessionStorage.getItem("username");

		lobbies.forEach((lobbyObj: any) => {
			const isHost = lobbyObj.hostUsername === currentUsername;
			addLobbyEntry(
				lobbyObj.id,
				lobbyObj.hostUsername,
				lobbyObj.mode,
				`${lobbyObj.players.length}/${lobbyObj.maxPlayers}`,
				() => {
					showToast.blue(`${isHost ? "Ready in" : "Joining"} lobby ${lobbyObj.id}`);
					joinLobby(
						lobbyObj.id,
						currentUsername!,
						Number(sessionStorage.getItem("user_id")!)
					);
				},
				isHost ? "READY" : "JOIN"
			);
		});
	} catch (err) {
		console.error("❌ Failed to load lobbies:", err);
		showToast.red("Failed to load lobbies");
	}
}

function addLobbyBlock(gameOptionId: string, gameOption: string | number) {
	const lobby = document.getElementById('lobby-list');
	const entry = document.createElement('li') as HTMLElement;
	entry.id = `entry-${gameOptionId}-${gameOption}`;
	entry.innerHTML = `${gameOption}`;
	lobby?.appendChild(entry);
}

function addLobbyEntry(
	id: string,
	userName: string,
	gameType: string,
	maxPlayer: string,
	onClickHandler: () => void,
	label: string = "JOIN"
) {
	addLobbyBlock(id, userName);
	addLobbyBlock(id, gameType);
	addLobbyBlock(id, maxPlayer);
	addLobbyBlock(id, /*html*/`
		<button id="join-button-${id}" class="text-orange-700 hover:bg-orange-500 hover:text-black">${label}</button>
	`);
	document.getElementById(`join-button-${id}`)?.addEventListener("click", onClickHandler);
	showToast.blue(`Lobby entry n: ${id} added`);
}

export async function fetchLobbies() {
	const res = await fetch(`${SERVER_URL}/lobbies`);
	if (!res.ok) throw new Error("Failed to fetch lobbies");
	return await res.json();
}

export async function createLobby(username: string, userId: number, mode = "classic", maxPlayers = 2) {
	const res = await fetch(`${SERVER_URL}/lobbies`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username, userId, mode, maxPlayers }),
	});
	if (!res.ok) {
		const errMsg = await res.text();
		throw new Error(errMsg || "Failed to create lobby");
	}
	return await res.json();
}

export async function joinLobby(lobbyId: string, username: string, userId: number) {
	const res = await fetch(`${SERVER_URL}/lobbies/${lobbyId}/join`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username, userId }),
	});
	if (!res.ok){
		showToast.red("Cannot join lobby");
		throw new Error("Cannot join lobby");	
	}
	showToast.green("Lobby joined");
	return await res.json();
}
