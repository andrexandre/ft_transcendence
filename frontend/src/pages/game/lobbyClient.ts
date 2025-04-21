// src/frontend/lobbySocket.ts
import { showToast } from "../../utils";
import { startGameClient } from "./gameClient";
import { connectToLobbySocket } from "./lobbySocket";

const SERVER_URL = "http://127.0.0.1:5000";
let lobbySocket: WebSocket | null = null;

export function connectToLobbySocket() {
	const userId = sessionStorage.getItem("user_id");
	if (!userId) {
		console.error("❌ user_id não encontrado no sessionStorage");
		return;
	}

	const socketUrl = `ws://127.0.0.1:5000/lobby-ws?userId=${userId}`;
	lobbySocket = new WebSocket(socketUrl);

	lobbySocket.onopen = () => {
		console.log("✅ Conectado ao Lobby WebSocket");
	};

	lobbySocket.onmessage = (event) => {
		try {
			const data = JSON.parse(event.data);
			if (data.type === "start") {
				console.log("🎮 Jogo vai começar com gameId:", data.gameId);
				showToast.green("🚀 Jogo a começar!");

				// Esconde menus e sidebar
				document.getElementById("sidebar")?.classList.add("hidden");
				document.getElementById("game-main-menu")?.classList.add("hidden");

				// Cria WebSocket da partida
				connectToMatchWebSocket(data.gameId);
			}
		} catch (err) {
			console.error("❌ Erro a processar mensagem WS:", err);
		}
	};

	lobbySocket.onclose = () => {
		console.warn("📴 Desconectado do Lobby WebSocket");
	};
}

function connectToMatchWebSocket(gameId: string) {
	const username = sessionStorage.getItem("username")!;
	const userId = sessionStorage.getItem("user_id")!;

	const ws = new WebSocket(`ws://127.0.0.1:5000/match-ws?gameId=${gameId}&username=${username}&userId=${userId}`);

	ws.onopen = () => {
		console.log(`🎮 Ligado ao jogo com gameId=${gameId}`);
		startGameClient(ws); // ✅ usa o novo startGameClient
	};
}


export async function renderLobbyList(): Promise<void> {
	try {
		const lobbies = await fetchLobbies();
		const list = document.getElementById('lobby-list')!;
		list.innerHTML = "";

		const currentUsername = sessionStorage.getItem("username");
		const currentUserId = Number(sessionStorage.getItem("user_id"));

		lobbies.forEach((lobbyObj: any) => {
			const isHost = lobbyObj.hostUserId === currentUserId;
			const isInLobby = lobbyObj.players.some((p: any) => p.userId === currentUserId);
			const isFull = lobbyObj.players.length === lobbyObj.maxPlayers;

			let buttonLabel = "JOIN";
			let handler = () => joinLobby(lobbyObj.id, currentUsername!, currentUserId);

			if (isHost) {
				if (isFull) {
					buttonLabel = "START";
					handler = async () => {
						showToast.green("🕹️ Starting game...");
						await startGameFromLobby(lobbyObj.id);
					};
				} else {
					buttonLabel = "QUIT";
					handler = async () => {
						await leaveLobby(lobbyObj.id, currentUserId, true);
						showToast.red("❌ Lobby disbanded");
					};
				}
			}
			
			addLobbyEntry(
				lobbyObj.id,
				lobbyObj.hostUsername,
				lobbyObj.mode,
				`${lobbyObj.players.length}/${lobbyObj.maxPlayers}`,
				handler,
				buttonLabel
			);
		});

	} catch (err) {
		console.error("❌ Failed to load lobbies:", err);
		showToast.red("Failed to load lobbies");
	}
}

export async function leaveLobby(lobbyId: string, userId: number, isHost: boolean) {
	const endpoint = isHost
		? `${SERVER_URL}/lobbies/${lobbyId}`
		: `${SERVER_URL}/lobbies/${lobbyId}/leave`;

	const res = await fetch(endpoint, {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ userId }),
	});
	if (!res.ok) throw new Error("Failed to leave/disband lobby");
	await renderLobbyList();
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
	connectToLobbySocket();
	showToast.green("Lobby joined");
	return await res.json();
}

export async function startGameFromLobby(lobbyId: string) {
	try {
		const userId = Number(sessionStorage.getItem("user_id"));
		const response = await fetch(`${SERVER_URL}/lobbies/${lobbyId}/start`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId }), // ✅ Send userId to backend
		});
		if (!response.ok) throw new Error("Failed to start game");

		const data = await response.json();
		console.log("🎮 Starting game with:", data.players);

		document.getElementById("sidebar")?.classList.add("hidden");
		document.getElementById("game-main-menu")?.classList.add("hidden");

	} catch (err) {
		console.error("❌ Error starting game:", err);
		showToast.red("Failed to start game");
	}
}
