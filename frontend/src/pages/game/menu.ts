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
	const sound = soundSelect.value === "On" ? 1 : 0;

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

 