
import { showToast } from "../../utils";
import dropdown from "../../components/dropdown";
import { connectToGameServer, createLobby, fetchLobbies } from "./lobbyClient";

let lobbyRefreshInterval: ReturnType<typeof setInterval> | null = null;

function initializeGameMainMenu(userData: {
	user_id: number;
	user_name: string;
	user_set_dificulty: string;
	user_set_tableSize: string;
	user_set_sound: number;
	}) {
	const username = userData.user_name;
	const userId = userData.user_id;    
	const difficulty = userData.user_set_dificulty;

	connectToGameServer({ username, userId });

	// Set Single dropdown
	dropdown.initialize('Single');

	if (!username) {
		console.error("❌ No username found in DB data!");
		dropdown.addElement('Single', 'button', 'item t-border-alt', 'User not found');
	} else {
		dropdown.addElement('Single', 'button', 'item t-border-alt', 'Classic', () => {
		document.getElementById('sidebar')?.classList.toggle('hidden');
		createLobby("Classic", 1, difficulty); // witgh difficulty
		});
	}
	// infinite change to shrink
	dropdown.addElement('Single', 'button', 'item t-border-alt','Infinity',
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

	dropdown.addElement("Multi", "button", "item t-border-alt", "Tournament", () => {
		showToast.green(`TNT clicked`)
		createLobby("TNT", 4);
	});

	dropdown.addElement("Multi", "button", "item t-border-alt", "1V1", () => {
		showToast(`1V1 clicked`)
		createLobby("1V1", 2);
	});

	dropdown.addElement("Multi", "button", "item t-border-alt", "Don't click", () => {
		document.body.innerHTML = "";
		document.body.className = "h-screen m-0 bg-cover bg-center bg-no-repeat";
		document.body.style.backgroundImage =
		"url('https://upload.wikimedia.org/wikipedia/commons/3/3b/Windo_9X_BSOD.png')";
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
	// Matrecos
	dropdown.addElement('Co-Op', 'button', 'item t-border-alt', 'Matrecos', async () => {
		try {
			showToast(`MTC clicked`)
			createLobby("MTC", 4);
		} catch (err) {
			showToast.red("❌ Failed to create Matrecos lobby");
		}
	});

	dropdown.addElement('Co-Op', 'button', 'item t-border-alt', 'Free for All', async () => {
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
	const response = await fetch(`http://${location.hostname}:5000/get-user-data`, {
		credentials: "include"
	});

	if (!response.ok)
		throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
	
	const userData = await response.json();
	(window as any).appUser = userData; ///fdx
	console.log("✅ User & Settings Loaded:", userData);

	// Preenche dropdowns com os dados recebidos
	difficultySelect.value = userData.user_set_dificulty;
	tableSizeSelect.value = userData.user_set_tableSize;
	soundSelect.value = userData.user_set_sound === 1 ? "On" : "Off";

	// Inicializa menu principal com dados do utilizador diretamente
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
	} catch (error) {
	  console.error("❌ Error saving settings:", error);
	}
  }
  