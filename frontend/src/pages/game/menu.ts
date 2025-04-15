import { showToast } from "../../utils";
import dropdown from "../../components/dropdown";
import { startSingleClassic } from "./single";
import * as lobbyClient from "./lobbyClient";
import { startGameClient, initGameCanvas } from "./gameClient";
import { playMusic } from "./soundManager";

playMusic("menuMusic");


let lobbyRefreshInterval: ReturnType<typeof setInterval> | null = null;

function initializeGameMainMenu() {
	// Set Single dropdown
	dropdown.initialize('Single');
	const username = sessionStorage.getItem("username");
	if (!username) {
		console.error("❌ No username found in sessionStorage!");
		dropdown.addElement('Single', 'button', 'item g-t-border-alt',
			'User not found');
	}
	else {
		dropdown.addElement('Single', 'button', 'item g-t-border-alt',
			'Classic', () => {
				const difficulty = sessionStorage.getItem("user_set_dificulty") || "Normal";
				const tableSize = sessionStorage.getItem("user_set_tableSize") || "Medium";
				const sound = sessionStorage.getItem("user_set_sound") === "1";
				document.getElementById('sidebar')?.classList.toggle('hidden');
				startSingleClassic(username, { difficulty, tableSize, sound })
			});
	}
	dropdown.addElement('Single', 'button', 'item g-t-border-alt',
		'Infinity', () => showToast(`Single Infinity clicked`));

	// Set Multi dropdown
	dropdown.initialize('Multi', async () => {
		const lobby = document.getElementById('lobby');
		const menu = document.getElementById(`dropdownMenu-Multi`);
		if (!menu?.classList.contains('hidden'))
			lobby?.classList.remove('hidden');
		else
			lobby?.classList.add('hidden');

		if (!lobby?.classList.contains('hidden')) {
			await lobbyClient.renderLobbyList();
			lobbyRefreshInterval = setInterval(lobbyClient.renderLobbyList, 1000);
		} else {
			if (lobbyRefreshInterval) {
				clearInterval(lobbyRefreshInterval);
				lobbyRefreshInterval = null;
			}
		}
	});
	dropdown.addElement('Multi', 'button', 'item g-t-border-alt', 'Tournament', async () => {
		const username = sessionStorage.getItem("username")!;
		const userId = Number(sessionStorage.getItem("user_id")!);
		try {
			const result = await lobbyClient.createLobby(username, userId, "TNMT", 2);
			showToast.green(`✅ Created lobby ${result.id}`);
		} catch (err) {
			showToast.red("❌ Failed to create lobby");
		}
	});
	dropdown.addElement('Multi', 'button', 'item g-t-border-alt', 'Don\'t click',
		() => {
			document.body.innerHTML = "";
			document.body.className = "h-screen m-0 bg-cover bg-center bg-no-repeat";
			document.body.style.backgroundImage = "url('https://upload.wikimedia.org/wikipedia/commons/3/3b/Windows_9X_BSOD.png')";
		});

	// Set Co-Op dropdown
	dropdown.initialize('Co-Op', async () => {
		const lobby = document.getElementById('lobby');
		const menu = document.getElementById(`dropdownMenu-Co-Op`);
		if (!menu?.classList.contains('hidden'))
			lobby?.classList.remove('hidden');
		else
			lobby?.classList.add('hidden');

		if (!lobby?.classList.contains('hidden')) {
			await lobbyClient.renderLobbyList();
			lobbyRefreshInterval = setInterval(lobbyClient.renderLobbyList, 1000);
		} else {
			if (lobbyRefreshInterval) {
				clearInterval(lobbyRefreshInterval);
				lobbyRefreshInterval = null;
			}
		}
	});
	dropdown.addElement('Co-Op', 'button', 'item g-t-border-alt', 'Matrecos',
		() => {
			showToast("Connecting to multiplayer game...");
			document.getElementById('sidebar')?.classList.toggle('hidden');
			startGameClient();
		});
	dropdown.addElement('Co-Op', 'button', 'item g-t-border-alt', 'Free for All',
		() => showToast(`Co-Op Free for All clicked`));
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
	onClickHandler: () => void
) {
	const currentUser = sessionStorage.getItem("username");
	const isHost = userName === currentUser;
	const label = isHost ? "READY" : "JOIN";

	addLobbyBlock(id, userName);
	addLobbyBlock(id, gameType);
	addLobbyBlock(id, maxPlayer);
	addLobbyBlock(id, /*html*/`
		<button id="join-button-${id}" class="text-orange-700 hover:bg-orange-500 hover:text-black">${label}</button>
	`);
	document.getElementById(`join-button-${id}`)?.addEventListener("click", onClickHandler);
	showToast.blue(`Lobby entry n: ${id} added`);
}

function removeLobbyEntry(id: string) {
	const lobby = document.getElementById('lobby-list');
	const entries = lobby?.querySelectorAll(`[id^="entry-${id}-"]`);
	entries?.forEach(entry => entry.remove());
	showToast.yellow(`Lobby entry n: ${id} removed`);
}

export async function initUserData() {
	console.log("📌 Menu Loaded, checking user...");

	const difficultySelect = document.getElementById('difficulty') as HTMLSelectElement;
	const tableSizeSelect = document.getElementById('table-size') as HTMLSelectElement;
	const soundSelect = document.getElementById('sound') as HTMLSelectElement;

	try {
		const response = await fetch("http://127.0.0.1:5000/get-user-data", { credentials: "include" });

		if (!response.ok) {
			throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
		}

		const userData = await response.json();
		console.log("✅ User & Settings Loaded:", userData);

		// Store settings in sessionStorage
		sessionStorage.setItem("username", userData.user_name);
		sessionStorage.setItem("user_id", userData.user_id);
		sessionStorage.setItem("user_set_dificulty", userData.user_set_dificulty);
		sessionStorage.setItem("user_set_tableSize", userData.user_set_tableSize);
		sessionStorage.setItem("user_set_sound", userData.user_set_sound.toString());

		// Update UI dropdowns with loaded settings
		difficultySelect.value = userData.user_set_dificulty;
		tableSizeSelect.value = userData.user_set_tableSize;
		soundSelect.value = userData.user_set_sound === 1 ? "On" : "Off";

		initializeGameMainMenu();
		initGameCanvas();
	} catch (error) {
		showToast.red(error as string);
		console.error("❌ Error loading user data:", error);
	}
}

export async function saveSettingsHandler() {
	const username = sessionStorage.getItem("username");
	if (!username) {
		console.error("❌ No username found! Cannot save settings.");
		return;
	}

	// Read values from dropdowns
	const difficultySelect = document.getElementById('difficulty') as HTMLSelectElement;
	const tableSizeSelect = document.getElementById('table-size') as HTMLSelectElement;
	const soundSelect = document.getElementById('sound') as HTMLSelectElement;

	const difficulty = difficultySelect.value;
	const tableSize = tableSizeSelect.value;
	const sound = soundSelect.value === "On" ? 1 : 0;

	console.log(`🎮 Saving settings for: ${{ username, difficulty, tableSize, sound }}`);

	// Save settings in sessionStorage
	sessionStorage.setItem("user_set_dificulty", difficulty);
	sessionStorage.setItem("user_set_tableSize", tableSize);
	sessionStorage.setItem("user_set_sound", sound.toString());

	// Send settings update to the database
	try {
		const response = await fetch("http://127.0.0.1:5000/save-settings", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			credentials: 'include',
			body: JSON.stringify({ username, difficulty, tableSize, sound }),
		});

		if (!response.ok)
			throw new Error(`Failed to save settings (${response.status})`);
		showToast.green('Settings saved');

	} catch (error) {
		console.error("❌ Error saving settings:", error);
	}
};

