import { startSingleClassic } from "./game.js";
const menu = document.getElementById("menu");
const gameCanvas = document.getElementById("gameCanvas");
// Main buttons
const singleBtn = document.getElementById("single");
const multiBtn = document.getElementById("multi");
const coopBtn = document.getElementById("coop");
const settingsBtn = document.getElementById("settings");
// Submenus
const singleMenu = document.getElementById("single-menu");
const multiMenu = document.getElementById("multi-menu");
const coopMenu = document.getElementById("coop-menu");
const settingsMenu = document.getElementById("settings-menu");
// Submenu buttons
const classicBtn = document.getElementById("classic");
const infinityBtn = document.getElementById("infinity");
const saveSettingsBtn = document.getElementById("save-settings");
// Settings fields
const difficultySelect = document.getElementById("difficulty");
const tableSizeSelect = document.getElementById("table-size");
const soundSelect = document.getElementById("sound");
// Function to toggle a submenu 
function toggleMenu(selectedMenu) {
    console.log("Toggling menu:", selectedMenu.id);
    // Collapse all other submenus before expanding the clicked
    document.querySelectorAll(".submenu").forEach((menu) => {
        if (menu !== selectedMenu) {
            menu.classList.remove("expanded");
            menu.classList.add("hidden"); // 🔹 Hide other menus
        }
    });
    if (selectedMenu.classList.contains("expanded")) {
        console.log("🔽 Closed");
        selectedMenu.classList.remove("expanded");
        selectedMenu.classList.add("hidden"); // 🔹 Hide when collapsed
    }
    else {
        console.log("🔼 Opened");
        selectedMenu.classList.add("expanded");
        selectedMenu.classList.remove("hidden"); // 🔹 Show when expanded
    }
}
// Collapse menus when clicking outside
document.addEventListener("click", (event) => {
    const isInsideMenu = event.target.closest("#menu");
    if (!isInsideMenu) {
        console.log("Click outside, collapsing menus.");
        document.querySelectorAll(".submenu").forEach(menu => menu.classList.add("hidden"));
    }
});
// Event listeners for toggling submenus
singleBtn.addEventListener("click", () => toggleMenu(singleMenu));
multiBtn.addEventListener("click", () => toggleMenu(multiMenu));
coopBtn.addEventListener("click", () => toggleMenu(coopMenu));
settingsBtn.addEventListener("click", () => toggleMenu(settingsMenu));
// Fetch user data when menu loads
document.addEventListener("DOMContentLoaded", async () => {
    console.log("📌 Menu Loaded, checking user...");
    try {
        const response = await fetch("/get-user-data", { credentials: "include" });
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
        soundSelect.value = userData.user_set_sound === 1 ? "on" : "off";
    }
    catch (error) {
        console.error("❌ Error loading user data:", error);
    }
});
// Start game with username + settings
classicBtn.addEventListener("click", (event) => {
    event.stopPropagation();
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
    menu.classList.add("hidden");
    gameCanvas.classList.remove("hidden");
    gameCanvas.classList.add("visible");
    startSingleClassic(username, { difficulty, tableSize, sound });
});
// Save Settings to sessionStorage & DB
saveSettingsBtn.addEventListener("click", async () => {
    const username = sessionStorage.getItem("username");
    if (!username) {
        console.error("❌ No username found! Cannot save settings.");
        return;
    }
    // Read values from dropdowns
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
        const response = await fetch("/save-settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, difficulty, tableSize, sound }),
        });
        if (!response.ok)
            throw new Error(`Failed to save settings (${response.status})`);
        console.log("✅ Settings saved successfully!");
    }
    catch (error) {
        console.error("❌ Error saving settings:", error);
    }
});
