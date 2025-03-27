import { showToast } from "../../utils";

export async function initGameMenu() {
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
		// console.log(tableSizeSelect);
		difficultySelect.value = userData.user_set_dificulty;
		tableSizeSelect.value = userData.user_set_tableSize;
		soundSelect.value = userData.user_set_sound === 1 ? "On" : "Off";

	} catch (error) {
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
	const sound = soundSelect.value === "on" ? 1 : 0;

	console.log(`🎮 Saving settings for: ${username}`);
	console.log("➡ Difficulty:", difficulty);
	console.log("➡ Table Size:", tableSize);
	console.log("➡ Sound:", sound);

	// Save settings in sessionStorage
	sessionStorage.setItem("user_set_dificulty", difficulty);
	sessionStorage.setItem("user_set_tableSize", tableSize);
	sessionStorage.setItem("user_set_sound", sound.toString());

	// Send settings update to the database
	try {
		const response = await fetch("http://127.0.0.1:5000/save-settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username, difficulty, tableSize, sound }),
		});

		if (!response.ok)
			throw new Error(`Failed to save settings (${response.status})`);
		console.log("✅ Settings saved successfully!");

	} catch (error) {
		console.error("❌ Error saving settings:", error);
	}
};

export function classicBtnHandler() {
	const username = sessionStorage.getItem("username");
	if (!username) {
		console.error("❌ No username found in sessionStorage!");
		return;
	}

	const difficulty = sessionStorage.getItem("user_set_dificulty") || "normal";
	const tableSize = sessionStorage.getItem("user_set_tableSize") || "medium";
	const sound = sessionStorage.getItem("user_set_sound") === "1";

	console.log(`🎯 Starting game for: ${username}`);
	console.log("➡ Difficulty:", difficulty);
	console.log("➡ Table Size:", tableSize);
	console.log("➡ Sound:", sound ? "On" : "Off");

    // Hide menu, show game
	const menu = document.getElementById('game-main-menu') as HTMLElement;
	const gameCanvas = document.getElementById('game-canvas') as HTMLElement;

	menu.classList.add("hidden"); 
	gameCanvas.classList.remove("hidden");
	showToast.yellow('Brotha refresh tha page, the connection is not done yet!')
	// gameCanvas.classList.add("visible");

	// startSingleClassic(username, { difficulty, tableSize, sound });
}
