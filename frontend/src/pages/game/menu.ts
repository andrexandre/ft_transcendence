import { showToast } from "../../utils";
import dropdown from "../../components/dropdown";

import { connectToGameServer, createLobby, fetchLobbies } from "./lobbyClient";

let lobbyRefreshInterval: ReturnType<typeof setInterval> | null = null;

function initializeGameMainMenu() {
	const username = sessionStorage.getItem("username")!;
	const userId = Number(sessionStorage.getItem("user_id")!);
	connectToGameServer({ username, userId });

	// Set Single dropdown
	dropdown.initialize('Single');
	if (!username) {
		console.error("❌ No username found in sessionStorage!");
		dropdown.addElement('Single', 'button', 'item g-t-border-alt', 'User not found');
	}
	else {
		dropdown.addElement('Single', 'button', 'item g-t-border-alt', 'Classic', () => {
			// const difficulty = sessionStorage.getItem("user_set_dificulty") || "Normal";
			// const tableSize = sessionStorage.getItem("user_set_tableSize") || "Medium";
			// const sound = sessionStorage.getItem("user_set_sound") === "1";
			document.getElementById('sidebar')?.classList.toggle('hidden');
			
			createLobby("Single", 1);
		});
	}
	dropdown.addElement('Single', 'button', 'item g-t-border-alt','Infinity',
		() => showToast(`Single Infinity clicked`));

	// 👥 Multiplayer
	dropdown.initialize('Multi', async () => {
		const lobby = document.getElementById('lobby');
		const menu = document.getElementById(`dropdownMenu-Multi`);
	
		if (!menu?.classList.contains('hidden'))
			lobby?.classList.remove('hidden');
		else
			lobby?.classList.add('hidden');
	
		if (!lobby?.classList.contains('hidden')) {
			await fetchLobbies();
	
			// 🚀 Start auto-refresh se ainda não estiver a correr
			if (!lobbyRefreshInterval) {
				lobbyRefreshInterval = setInterval(fetchLobbies, 5000);
				console.log("🔄 Auto-refresh started");
			}
		} else {
			// 🛑 Parar o refresh se o menu for fechado
			if (lobbyRefreshInterval) {
				clearInterval(lobbyRefreshInterval);
				lobbyRefreshInterval = null;
				console.log("⛔ Auto-refresh stopped");
			}
		}
	});

	dropdown.addElement("Multi", "button", "item g-t-border-alt", "Tournament", () => {
		showToast.green(`TNT clicked`)
		createLobby("TNT", 8);
	});

	dropdown.addElement("Multi", "button", "item g-t-border-alt", "1V1", () => {
		showToast(`1V1 clicked`)
		createLobby("1V1", 2);
	});

	dropdown.addElement("Multi", "button", "item g-t-border-alt", "Don't click", () => {
		document.body.innerHTML = "";
		document.body.className = "h-screen m-0 bg-cover bg-center bg-no-repeat";
		document.body.style.backgroundImage =
			"url('https://upload.wikimedia.org/wikipedia/commons/3/3b/Windows_9X_BSOD.png')";
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
			await fetchLobbies(); 
	
			// 🚀 Start auto-refresh se ainda não estiver a correr
			if (!lobbyRefreshInterval) {
				lobbyRefreshInterval = setInterval(fetchLobbies, 5000);
				console.log("🔄 Auto-refresh started");
			}
		} else {
			// 🛑 Parar o refresh se o menu for fechado
			if (lobbyRefreshInterval) {
				clearInterval(lobbyRefreshInterval);
				lobbyRefreshInterval = null;
				console.log("⛔ Auto-refresh stopped");
			}
		}
	});
	
	// Matrecos
	dropdown.addElement('Co-Op', 'button', 'item g-t-border-alt', 'Matrecos', async () => {
		const username = sessionStorage.getItem("username")!;
		const userId = Number(sessionStorage.getItem("user_id")!);
		try {
			showToast(`MTC clicked`)
			createLobby("MTC", 4);
		} catch (err) {
			showToast.red("❌ Failed to create Matrecos lobby");
		}
	});
	
	// Free for All
	dropdown.addElement('Co-Op', 'button', 'item g-t-border-alt', 'Free for All', async () => {
		const username = sessionStorage.getItem("username")!;
		const userId = Number(sessionStorage.getItem("user_id")!);
		try {
			showToast(`FFA clicked`)
			createLobby("FFA", 4);
		} catch (err) {
			showToast.red("❌ Failed to create FFA lobby");
		}
	});
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

// async function toggleLobbyVisibility(menuId: string) {
// 	const lobby = document.getElementById('lobby');
// 	const menu = document.getElementById(`dropdownMenu-${menuId}`);
// 	const isOpen = !menu?.classList.contains('hidden');

// 	if (isOpen) lobby?.classList.remove('hidden');
// 	else lobby?.classList.add('hidden');

// 	if (!lobby?.classList.contains('hidden')) {
// 		await fetchLobbies();
// 		if (!lobbyRefreshInterval) {
// 			lobbyRefreshInterval = setInterval(fetchLobbies, 5000);
// 			console.log("🔄 Auto-refresh started");
// 		}
// 	} else {
// 		if (lobbyRefreshInterval) {
// 			clearInterval(lobbyRefreshInterval);
// 			lobbyRefreshInterval = null;
// 			console.log("⛔ Auto-refresh stopped");
// 		}
// 	}
// }