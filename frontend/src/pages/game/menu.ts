import { showToast } from "../../utils";
import dropdown from "../../components/dropdown";
import { startSingleClassic } from "./single";
import * as lobbyClient from "./lobbyClient";
import { startGameClient, initGameCanvas } from "./gameClient";

let lobbyRefreshInterval: ReturnType<typeof setInterval> | null = null;

function initializeGameMainMenu() {
	// Set Single dropdown
	dropdown.initialize('Single');
	const username = sessionStorage.getItem("username");
	if (!username) {
		console.error("❌ No username found in sessionStorage!");
		dropdown.addElement('Single', 'button', 'item t-border-alt',
			'User not found');
	}
	else {
		dropdown.addElement('Single', 'button', 'item t-border-alt',
			'Classic', () => {
				const difficulty = sessionStorage.getItem("user_set_dificulty") || "Normal";
				const tableSize = sessionStorage.getItem("user_set_tableSize") || "Medium";
				const sound = sessionStorage.getItem("user_set_sound") === "1";
				document.getElementById('sidebar')?.classList.toggle('hidden');
				startSingleClassic(username, { difficulty, tableSize, sound })
			});
	}
	dropdown.addElement('Single', 'button', 'item t-border-alt',
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
			lobbyRefreshInterval = setInterval(lobbyClient.renderLobbyList, 5000);
		} else {
			if (lobbyRefreshInterval) {
				clearInterval(lobbyRefreshInterval);
				lobbyRefreshInterval = null;
			}
		}
	});
	// Tournament
	dropdown.addElement('Multi', 'button', 'item t-border-alt', 'Tournament', async () => {
		const username = sessionStorage.getItem("username")!;
		const userId = Number(sessionStorage.getItem("user_id")!);
		try {
			const result = await lobbyClient.createLobby(username, userId, "TNMT", 2);
			showToast.green(`✅ Created TNMT lobby ${result.id}`);
		} catch (err) {
			showToast.red("❌ Failed to create lobby");
		}
	});

	dropdown.addElement('Multi', 'button', 'item t-border-alt', '1V1', async () => {
		const username = sessionStorage.getItem("username")!;
		const userId = Number(sessionStorage.getItem("user_id")!);
		try {
			const result = await lobbyClient.createLobby(username, userId, "1V1", 2);
			showToast.green(`✅ Created 1V1 lobby: ${result.id}`);
		} catch (err) {
			showToast.red("❌ Failed to create 1V1 lobby");
		}
	});

	// Dont click
	dropdown.addElement('Multi', 'button', 'item t-border-alt', 'Don\'t click',
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

		await lobbyClient.renderLobbyList();
		if (!lobbyRefreshInterval) {
			lobbyRefreshInterval = setInterval(lobbyClient.renderLobbyList, 50000);
		}
	});

	// Matrecos
	dropdown.addElement('Co-Op', 'button', 'item t-border-alt', 'Matrecos', async () => {
		const username = sessionStorage.getItem("username")!;
		const userId = Number(sessionStorage.getItem("user_id")!);
		try {
			const result = await lobbyClient.createLobby(username, userId, "MTC", 4);
			showToast.green(`✅ Created Matrecos lobby: ${result.id}`);
		} catch (err) {
			showToast.red("❌ Failed to create Matrecos lobby");
		}
	});

	// Free for All
	dropdown.addElement('Co-Op', 'button', 'item t-border-alt', 'Free for All', async () => {
		const username = sessionStorage.getItem("username")!;
		const userId = Number(sessionStorage.getItem("user_id")!);
		try {
			const result = await lobbyClient.createLobby(username, userId, "FFA", 4);
			showToast.green(`✅ Created FFA lobby: ${result.id}`);
		} catch (err) {
			showToast.red("❌ Failed to create FFA lobby");
		}
	});
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
		const response = await fetch(`http://${location.hostname}:5000/get-user-data`, { credentials: "include" });

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
		const response = await fetch(`http://${location.hostname}:5000/save-settings`, {
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
