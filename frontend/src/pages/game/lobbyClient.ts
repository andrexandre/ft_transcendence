// frontend/src/pages/game/lobbyClient.ts
import { showToast } from "../../utils";
import { connectToMatch } from "./rendering";

let socket: WebSocket | null = null;
let lobbyId: string | null = null;
let user: { username: string; userId: number } | null = null;
let matchSocketStarted = false;



export function connectToGameServer(userInfo: { username: string; userId: number }) {
	if (socket && socket.readyState === WebSocket.OPEN) {
		console.warn("🚫 Já estás conectado ao servidor.");
		return;
	}

	user = userInfo;
	const { username, userId } = user;

	socket = new WebSocket("ws://127.0.0.1:5000/lobby-ws");

	socket.onopen = () => {
		console.log(`✅ WebSocket connected for: ${username} → (${userId}) → ${socket!.url}`);
	};

	socket.onmessage = (event) => {
		const data = JSON.parse(event.data);
		console.log("📨 WS Message:", data);
		
		switch (data.type) {
			case "lobby-created":
				lobbyId = data.lobbyId;
				showToast.green(`✅ Lobby created: ${data.lobbyId}`);

				if (data.maxPlayers === 1) {
					console.log("🎯 Singleplayer detected! Auto-starting game.");
					setTimeout(() => matchStartGame(), 500);
				}
				break;

			case "lobby-joined":
				lobbyId = data.lobbyId;
				showToast.green(`✅ Joined lobby!`);
				break;

			case "left-lobby":
				lobbyId = null;
				showToast.yellow(`👋 Saiu do lobby`);
				break;

			case "game-start":
				if (matchSocketStarted) return;
				matchSocketStarted = true;

				console.log("🎮 Game start recebido! A abrir ligação para /match-ws");
				showToast.green(`🎮 Game started! You are: ${data.playerRole}`);
				document.getElementById('sidebar')?.classList.add('hidden');

				const matchSocket = new WebSocket(`ws://127.0.0.1:5000/match-ws?gameId=${data.gameId}`);
				console.log("🛰️ Connecting to match-ws:", data.gameId);

				matchSocket.onopen = () => {
					console.log("✅ Connected to match WebSocket for game:", data.gameId);
					connectToMatch(matchSocket, data.playerRole);
				};

				matchSocket.onerror = () => {
					console.error("❌ Failed to connect to match WebSocket");
					showToast.red("❌ Falha ao conectar ao jogo");
					matchSocketStarted = false;
				};
				break;

			case "error":
				showToast.red(`❌ ${data.message}`);
				break;
		}
	};

	socket.onerror = () => showToast.red("❌ WebSocket connection error");
	socket.onclose = () => showToast.red("🔌 Disconnected from server");
}

export function createLobby(gameMode: string, maxPlayers: number) {
	if (!socket || socket.readyState !== WebSocket.OPEN) return;
	if (lobbyId) return showToast.red("🚫 Já estás num lobby");

	socket.send(JSON.stringify({
		type: "create-lobby",
		gameMode,
		maxPlayers
	}));
}

export function joinLobby(id: string) {
	if (!socket || socket.readyState !== WebSocket.OPEN) return;
	if (lobbyId) return showToast.red("🚫 Já estás num lobby");

	socket.send(JSON.stringify({ type: "join-lobby", lobbyId: id }));
}

export function leaveLobby() {
	if (!socket || socket.readyState !== WebSocket.OPEN) return;
	socket.send(JSON.stringify({ type: "leave-lobby" }));
	lobbyId = null;
}

export function matchStartGame() {
	if (!socket || !lobbyId || !user) {
		console.error("❌ Não é possível iniciar jogo. socket, lobbyId ou user faltando.");
		return;
	}

	console.log("🚀 A pedir ao servidor para startar o jogo:", lobbyId);
	socket.send(JSON.stringify({
		type: "start-game",
		lobbyId,
		requesterId: user.userId
	}));
}

export function clearLobbyId() {
	lobbyId = null;
	matchSocketStarted = false;
}

export async function fetchLobbies() {
	try {
		const res = await fetch("http://127.0.0.1:5000/lobbies", {
			credentials: "include"
		});
		if (!res.ok) throw new Error("Failed to fetch lobbies");
		const lobbies = await res.json();
		renderLobbyList(lobbies);
	} catch (err) {
		console.error("❌ Failed to load lobbies:", err);
		showToast.red("Failed to load lobbies");
	}
}

function renderLobbyList(lobbies: any[]) {
	const list = document.getElementById("lobby-list");
	if (!list) return;

	list.innerHTML = "";

	const currentUserId = Number(sessionStorage.getItem("user_id"));
	if (lobbies.length === 0) {
		list.innerHTML = "<p class='text-gray-500'>😴 Nenhum lobby disponível.</p>";
		return;
	}

	for (const lobby of lobbies) {
		const isHost = Number(lobby.hostUserId) === currentUserId;
		const isInLobby = lobbyId === lobby.id;
		const isFull = lobby.playerCount === lobby.maxPlayers;

		const div = document.createElement("div");
		div.className = "lobby-entry flex flex-row justify-between items-center w-full border-b py-2 px-4";

		const host = document.createElement("span");
		host.textContent = lobby.host || "???";

		const mode = document.createElement("span");
		mode.textContent = lobby.gameMode;

		const players = document.createElement("span");
		players.textContent = `${lobby.playerCount}/${lobby.maxPlayers}`;

		const btn = document.createElement("button");
		btn.className = "px-3 py-1 rounded bg-orange-700 text-black hover:bg-orange-500";

		if (isHost && isFull) {
			btn.textContent = "START";
			btn.onclick = () => {
				showToast.green("🕹️ Starting game...");
				matchStartGame();
			};
		} else if (isHost && isInLobby) {
			btn.textContent = "QUIT";
			btn.onclick = () => {
				showToast.red("❌ Leaving lobby...");
				leaveLobby();
				setTimeout(fetchLobbies, 300);
			};
		} else if (isInLobby) {
			btn.textContent = "QUIT";
			btn.onclick = () => {
				showToast.red("❌ Leaving lobby...");
				leaveLobby();
				setTimeout(fetchLobbies, 300);
			};
		} else {
			btn.textContent = "JOIN";
			btn.onclick = () => {
				joinLobby(lobby.id);
			};
		}

		div.appendChild(host);
		div.appendChild(mode);
		div.appendChild(players);
		div.appendChild(btn);
		list.appendChild(div);
	}
}
