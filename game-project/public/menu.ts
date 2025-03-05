import { startSingleClassic } from "./game.js";

const menu = document.getElementById("menu") as HTMLDivElement;
const gameCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement;

// ✅ Main buttons
const singleBtn = document.getElementById("single") as HTMLButtonElement;
const multiBtn = document.getElementById("multi") as HTMLButtonElement;
const coopBtn = document.getElementById("coop") as HTMLButtonElement;
const settingsBtn = document.getElementById("settings") as HTMLButtonElement;

// ✅ Submenus
const singleMenu = document.getElementById("single-menu") as HTMLDivElement;
const multiMenu = document.getElementById("multi-menu") as HTMLDivElement;
const coopMenu = document.getElementById("coop-menu") as HTMLDivElement;
const settingsMenu = document.getElementById("settings-menu") as HTMLDivElement;

// ✅ Submenu buttons
const classicBtn = document.getElementById("classic") as HTMLButtonElement;
const infinityBtn = document.getElementById("infinity") as HTMLButtonElement;
const saveSettingsBtn = document.getElementById("save-settings") as HTMLButtonElement;

// ✅ Settings fields
const difficultySelect = document.getElementById("difficulty") as HTMLSelectElement;
const tableSizeSelect = document.getElementById("table-size") as HTMLSelectElement;
const soundSelect = document.getElementById("sound") as HTMLSelectElement;

/** 
 * ✅ Function to toggle a submenu 
 */
function toggleMenu(selectedMenu: HTMLDivElement) {
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
    } else {
        console.log("🔼 Opened");
        selectedMenu.classList.add("expanded");
        selectedMenu.classList.remove("hidden"); // 🔹 Show when expanded
    }
}


// ✅ Collapse menus when clicking outside
document.addEventListener("click", (event) => {
    const isInsideMenu = (event.target as HTMLElement).closest("#menu");
    
    if (!isInsideMenu) {
        console.log("Click outside, collapsing menus.");
        document.querySelectorAll(".submenu").forEach(menu => menu.classList.add("hidden"));
    }
});

// ✅ Event listeners for toggling submenus
singleBtn.addEventListener("click", () => toggleMenu(singleMenu));
multiBtn.addEventListener("click", () => toggleMenu(multiMenu));
coopBtn.addEventListener("click", () => toggleMenu(coopMenu));
settingsBtn.addEventListener("click", () => toggleMenu(settingsMenu));


// ✅ Fetch user data when menu loads
document.addEventListener("DOMContentLoaded", async () => {
    console.log("📌 Menu Loaded, checking user...");

    // ✅ Get username from cookies
    const username = getCookie("username");
    console.log(`🔍 Username from cookies: ${username}`);

    if (!username) {
        console.error("❌ No username found in cookies.");
        return;
    }

    // ✅ Store username in sessionStorage
    sessionStorage.setItem("username", username);

    // ✅ Check if the user exists in `db_game`
    const userExists = await checkOrCreateUser(username);

    if (userExists) {
        console.log(`✅ User '${username}' found in db_game.`);
    } else {
        console.log(`🆕 User '${username}' was created in db_game.`);
    }
});

/** 
 * ✅ Helper function to get cookies
 */
function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
}

/** 
 * ✅ Check if the user exists in `db_game`, if not create it
 */
async function checkOrCreateUser(username: string) {
    try {
        const response = await fetch(`/get-user?username=${username}`);
        if (!response.ok) throw new Error("Failed to fetch user");
        const data = await response.json();
        return data.exists; // Returns `true` if the user exists, `false` if created
    } catch (error) {
        console.error("❌ Error checking user in db_game:", error);
        return false;
    }
}

// ✅ Start game & pass username
classicBtn.addEventListener("click", (event) => {
    const username = sessionStorage.getItem("username");
    console.log(`🎯 Starting game for: ${username}`);
    event.stopPropagation();
    
    if (username) {
         // Hide menu, show game
        menu.classList.add("hidden"); 
        gameCanvas.classList.remove("hidden");
        gameCanvas.classList.add("visible");

        startSingleClassic(username);
    } else {
        console.error("❌ No username found!");
    }
});

// ✅ Save Settings (For now, just logs the values)
saveSettingsBtn.addEventListener("click", () => {
    const difficulty = difficultySelect.value;
    const tableSize = tableSizeSelect.value;
    const sound = soundSelect.value;

    console.log("🎮 Settings Saved:");
    console.log("➡ Difficulty:", difficulty);
    console.log("➡ Table Size:", tableSize);
    console.log("➡ Sound:", sound);
    
    // Future: Send settings to the server when implementing persistence
});
