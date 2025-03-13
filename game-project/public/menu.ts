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

// ✅ Function to toggle a submenu 
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

    try {
        const response = await fetch("/get-user-data", { credentials: "include" });

        if (!response.ok) throw new Error(`Server responded with ${response.status}: ${response.statusText}`);

        const userData = await response.json();
        console.log("✅ User & Settings Loaded:", userData);

        // ✅ Store user info in sessionStorage
        sessionStorage.setItem("username", userData.user_name);
        sessionStorage.setItem("userId", userData.user_id.toString());

    } catch (error) {
        console.error("❌ Error loading user data:", error);
    }
});


// ✅ Check if the user exists in `db_game`, if not create it
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
// ✅ Save Settings (Optimized - No Extra User Fetch)
// saveSettingsBtn.addEventListener("click", async () => {
//     const username = sessionStorage.getItem("username");
//     if (!username) {
//         console.error("❌ No username found! Cannot save settings.");
//         return;
//     }

//     // ✅ Read settings from dropdowns
//     const difficulty = difficultySelect.value;
//     const tableSize = tableSizeSelect.value;
//     const sound = soundSelect.value === "on" ? 1 : 0;

//     console.log(`🎮 Saving settings for: ${username}`);
//     console.log("➡ Difficulty:", difficulty);
//     console.log("➡ Table Size:", tableSize);
//     console.log("➡ Sound:", sound);

//     // ✅ Save settings in sessionStorage (Frontend)
//     sessionStorage.setItem("user_set_dificulty", difficulty);
//     sessionStorage.setItem("user_set_tableSize", tableSize);
//     sessionStorage.setItem("user_set_sound", sound.toString());

//     // ✅ Send settings update to the database (Backend)
//     try {
//         const response = await fetch("/save-settings", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ username, difficulty, tableSize, sound }),
//         });

//         if (!response.ok) throw new Error("Failed to save settings");

//         console.log("✅ Settings saved successfully!");

//     } catch (error) {
//         console.error("❌ Error saving settings:", error);
//     }
// });
