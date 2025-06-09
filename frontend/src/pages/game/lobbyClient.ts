// frontend/src/pages/game/lobbyClient.ts
import { showToast, userInfo } from "../../utils";
import { stopSound, sounds } from "./audio";
import { connectToMatch } from "./rendering";	
import { renderTournamentBracket, tournamentState} from "./tournamentRender";

let lobbyId: string | null = null;
let user = { get username() { return userInfo.username; }, get userId() { return userInfo.userId; } };
let matchSocketStarted = false;

export function connectToGameServer(event : MessageEvent<any>) {
	user = {username: userInfo.username, userId: userInfo.userId}
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
			if (userInfo.pendingInviteTo)
			{
				userInfo.chat_sock!.send(JSON.stringify({
					type: 'invite-to-game',
					friend: userInfo.pendingInviteTo,
					from: userInfo.username,
					lobbyId: data.lobbyId
				}));
			}
			break;

		case "lobby-joined":
			lobbyId = data.lobbyId;
			const newLobbyId = data.playerId;
			console.log(`✅ Lobby joined, lobbyId set to: ${newLobbyId}`);
			showToast.green(`✅ Joined lobby!`);
			break;

		case "left-lobby":
			lobbyId = null;
			showToast.yellow(`👋 Saiu do lobby`);
			break;
		
		// TNT in
		case "show-bracket":
			if (data.state) {
				tournamentState.rounds = data.state.rounds;
				tournamentState.currentRound = data.state.currentRound;
			}
			renderTournamentBracket();
			break;

			
		case "start-round":
			renderTournamentBracket();
			break;

		case "end-round":
			renderTournamentBracket();
			break;

		case "end-tournament":
			renderTournamentBracket();
			userInfo.game_sock?.send(JSON.stringify({ type: 'leave-lobby' }));
			break;

		// TNT close

		case "match-start":
			if (matchSocketStarted) return;
			matchSocketStarted = true;
			// sound added
			if ((window as any).appUser?.user_set_sound === 1) {
				stopSound("menuMusic");
				sounds.gameMusic.play().catch(() => {});
			}

			console.log("🎮 Game start recebido! A abrir ligação para /match-ws");
			showToast.green(`🎮 Game started! You are: ${data.playerRole}`);
			userInfo.match_sock = new WebSocket(`ws://${location.hostname}:5000/match-ws?gameId=${data.gameId}`);
			console.log("🛰️ Connecting to match-ws:", data.gameId);

			userInfo.match_sock.onopen = () => {
				console.log("✅ Connected to match WebSocket for game:", data.gameId);
				connectToMatch(data.playerRole);
			};

			userInfo.match_sock.onerror = () => {
				console.error("❌ Failed to connect to match WebSocket");
				showToast.red("❌ Falha ao conectar ao jogo");
				matchSocketStarted = false;
			};
			break;

		case "error":
			showToast.red(`❌ ${data.message}`);
			break;
	};
}

export function createLobby(gameMode: string, maxPlayers: number, difficulty?: string) {
	if (!userInfo.game_sock || userInfo.game_sock.readyState !== WebSocket.OPEN) return;
	// if (lobbyId) return showToast.red("🚫 Já estás num lobby");
	console.log("🚀 A criar lobby:", gameMode, maxPlayers, difficulty);

	userInfo.game_sock.send(JSON.stringify({
		type: "create-lobby",
		gameMode,
		maxPlayers,
		difficulty
	}));
}

export function joinLobby(id: string) {
	if (!userInfo.game_sock || userInfo.game_sock.readyState !== WebSocket.OPEN) return;
	if ((window as any).lobbyId) {
		console.warn(`🚫 Already in lobby: ${(window as any).lobbyId}, can't join ${id}`);
		return showToast.red("🚫 Já estás num lobby");
	}
	console.log(`📩 Joining lobby: ${id}`);
	userInfo.game_sock.send(JSON.stringify({ type: "join-lobby", lobbyId: id }));
}

export function leaveLobby() {
	if (!userInfo.game_sock || userInfo.game_sock.readyState !== WebSocket.OPEN) return;
	userInfo.game_sock.send(JSON.stringify({ type: "leave-lobby" }));
	lobbyId = null;
}

export function matchStartGame() {
	if (!userInfo.game_sock || !lobbyId || !user) {
		console.error("❌ Não é possível iniciar jogo. socket, lobbyId ou user faltando.");
		return;
	}
	
	console.log("🚀 A pedir ao servidor para startar o jogo:", lobbyId);
	userInfo.game_sock.send(JSON.stringify({
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
		const res = await fetch(`http://${location.hostname}:8080/game/lobbies`, {
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

function addLobbyBlock(gameOptionId: string, gameOption: string | number) {
	const lobby = document.getElementById('lobby-list');
	const entry = document.createElement('li') as HTMLElement;
	entry.id = `entry-${gameOptionId}-${gameOption}`;
	entry.innerHTML = `${gameOption}`;
	entry.className = "truncate";
	lobby?.appendChild(entry);
}

function addLobbyEntry(
	id: string,
	userName: string,
	gameType: string,
	maxPlayer: string,
) {
	addLobbyBlock(id, userName);
	addLobbyBlock(id, gameType);
	addLobbyBlock(id, maxPlayer);
	addLobbyBlock(id, /*html*/`
		<button id="join-button-${id}" class="text-orange-700 hover:bg-orange-500 hover:text-black">???</button>
	`);
}

function renderLobbyList(lobbies: any[]) {
	const list = document.getElementById("lobby-list");
	if (!list) return;

	list.innerHTML = "";

	const currentUserId = (window as any).appUser?.user_id;
	// console.log("🔍 Current user ID:", currentUserId);

	if (currentUserId === undefined) {
		console.error("❌ No current user loaded. Cannot render lobbies.");
		return;
	}

	if (lobbies.length === 0) {
		list.innerHTML = /*html*/`<p class='text-c-secondary col-span-4'>No lobby available</p>`;
		return;
	}

	for (const lobby of lobbies) {
		const isHost = Number(lobby.hostUserId) === currentUserId;
		const isFull = lobby.playerCount === lobby.maxPlayers;
		const isInLobby = lobby.players?.some((p: any) => Number(p.userId) === Number(currentUserId));

		// console.log(`📦 Lobby: ${lobby.id} | isHost: ${isHost} | isInLobby: ${isInLobby} | isFull: ${isFull}`);
		// console.log("🛠️ Lobby data:", lobbyId);

		addLobbyEntry(
			lobby.id,
			lobby.host,
			lobby.gameMode,
			`${lobby.playerCount}/${lobby.maxPlayers}`
		);
		const btn = document.getElementById(`join-button-${lobby.id}`) as HTMLElement;

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
				setTimeout(fetchLobbies, 10);
			};
		} else if (isInLobby) {
			btn.textContent = "QUIT";
			btn.onclick = () => {
				showToast.red("❌ Leaving lobby...");
				leaveLobby();
				setTimeout(fetchLobbies, 10);
			};
		} else {
			btn.textContent = "JOIN";
			btn.onclick = () => {
				joinLobby(lobby.id);
				setTimeout(fetchLobbies, 10);
			};
		}
	}
}

