// frontend/src/pages/game/menu.ts
import { showToast, userInfo } from "../../utils";
import dropdown from "../../components/dropdown";
import { connectToGameServer, createLobby, fetchLobbies } from "./lobbyClient";
import { sounds, initSounds, playSound } from "./audio";


let lobbyRefreshInterval: ReturnType<typeof setInterval> | null = null;

export function turnOnGame() {
	if (userInfo.game_sock?.readyState === WebSocket.OPEN) {
		showToast.red("🚫 Lobby socket já está aberto");
		return;
	}

	const url = `ws://${location.hostname}:5000/lobby-ws`;
	userInfo.game_sock = new WebSocket(url);

	userInfo.game_sock.onopen = () => {
		console.log(`✅ WebSocket connected for: ${userInfo.username} (${userInfo.userId}) → ${url}`);
	};

	userInfo.game_sock.onerror = () => showToast.red("❌ Erro na ligação do WebSocket");
	userInfo.game_sock.onclose = () => console.log("🔌 Ligação terminada com o servidor");

	userInfo.game_sock.onmessage = (event) => {
		connectToGameServer(event);
	};
}

export function turnOffGame() {
	if (userInfo.game_sock) {
		if (userInfo.game_sock.readyState === WebSocket.OPEN) {
			console.log("🚫 Lobby socket já está fechado");
			userInfo.game_sock.close();
		}
		userInfo.game_sock = null;
	}
}

function initializeGameMainMenu(userData: {
	user_id: number;
	user_name: string;
	user_set_dificulty: string;
	user_set_tableSize: string;
	user_set_sound: number;
	}) {
	const username = userInfo.username;

	// 🎮 Single dropdown
	dropdown.initialize('Single');
	// Classic
	if (!username) {
		console.error("❌ No username found in DB data!");
		dropdown.addElement('Single', 'button', 'item t-border-alt', 'User not found');
	} else {
		dropdown.addElement('Single', 'button', 'item t-border-alt', 'Classic', () => {
		createLobby("Classic", 1, userData.user_set_dificulty); // with difficulty
		});
	}

	// Dont click
	dropdown.addElement("Single", "button", "item t-border-alt", "Don't click", () => {
		document.body.innerHTML = "";
		document.body.className = "h-screen m-0 bg-cover bg-center bg-no-repeat";
		document.body.style.backgroundImage =
		"url('https://upload.wikimedia.org/wikipedia/commons/3/3b/Windows_9X_BSOD.png')";
	});

	// 👥 Multiplayer dropdown
	dropdown.initialize('Multi', async () => {
		const lobby = document.getElementById('lobby');
		const menu = document.getElementById(`dropdownMenu-Multi`);

		if (!menu?.classList.contains('hidden'))
		lobby?.classList.remove('hidden');
		else
		lobby?.classList.add('hidden');

		if (!lobby?.classList.contains('hidden')) {
		await fetchLobbies();
		if (!lobbyRefreshInterval) {
			lobbyRefreshInterval = setInterval(fetchLobbies, 5000);
			console.log("🔄 Auto-refresh started");
		}
		} else {
		if (lobbyRefreshInterval) {
			clearInterval(lobbyRefreshInterval);
			lobbyRefreshInterval = null;
			console.log("⛔ Auto-refresh stopped");
		}
		}
	});

	// Tournament
	dropdown.addElement("Multi", "button", "item t-border-alt", "Tournament", () => {
		createLobby("TNT", 4);
	});

	// 1V1
	dropdown.addElement("Multi", "button", "item t-border-alt", "1V1", () => {
		createLobby("1V1", 2);
	});

	// Matrecos
	dropdown.addElement('Multi', 'button', 'item t-border-alt', 'Matrecos', () => {
		createLobby("MTC", 4);
	});
}

export async function initUserData() {
	console.log("📌 Menu Loaded, checking user...");

	const difficultySelect = document.getElementById('difficulty') as HTMLSelectElement;
	const tableSizeSelect = document.getElementById('table-size') as HTMLSelectElement;
	const soundSelect = document.getElementById('sound') as HTMLSelectElement;

	try {
	const response = await fetch(`http://${location.hostname}:5000/get-user-data`, {
		credentials: "include"
	});

	if (!response.ok)
		throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
	
	const userData = await response.json();
	(window as any).appUser = userData;
	console.log("✅ User & Settings Loaded:", userData);
	difficultySelect.value = userData.user_set_dificulty;
	tableSizeSelect.value = userData.user_set_tableSize;
	soundSelect.value = userData.user_set_sound === 1 ? "On" : "Off";

	// Inii sound
	if (userData.user_set_sound === 1) {
		initSounds();
		setTimeout(() => {
			sounds.menuMusic.play().catch(() => {});
		}, 100); // evitar autoplay block
	}
	
	// Init Game Menu
	initializeGameMainMenu(userData);

	} catch (error) {
		showToast.red(error as string);
		console.error("❌ Error loading user data:", error);
	}
}

export async function saveSettingsHandler() {
	const user = (window as any).appUser;
	if (!user || !user.user_name) {
	  console.error("❌ No user loaded! Cannot save settings.");
	  return;
	}
  
	const difficultySelect = document.getElementById('difficulty') as HTMLSelectElement;
	const tableSizeSelect = document.getElementById('table-size') as HTMLSelectElement;
	const soundSelect = document.getElementById('sound') as HTMLSelectElement;
  
	const difficulty = difficultySelect.value;
	const tableSize = tableSizeSelect.value;
	const sound = soundSelect.value === "On" ? 1 : 0;
  
	console.log(`🎮 Saving settings for:`, { user, difficulty, tableSize, sound });
  
	try {
		const response = await fetch(`http://${location.hostname}:5000/save-settings`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			credentials: 'include',
			body: JSON.stringify({
			username: user.user_name,
			difficulty,
			tableSize,
			sound
		})
	});
  
	if (!response.ok) throw new Error(`Failed to save settings (${response.status})`);
	showToast.green('Settings saved');

	// Update userData
	(window as any).appUser.user_set_dificulty = difficulty;
	(window as any).appUser.user_set_tableSize = tableSize;
	(window as any).appUser.user_set_sound = sound;

	if (sound === 1) {
		playSound("menuMusic");
		} else {
			sounds.menuMusic.pause();
			sounds.menuMusic.currentTime = 0;
		}

	} catch (error) {
	  console.error("❌ Error saving settings:", error);
	}
  }
  