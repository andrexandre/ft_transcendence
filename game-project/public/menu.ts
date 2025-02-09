import { startSingleClassic } from "./game.js";

const menu = document.getElementById("menu") as HTMLDivElement;
const gameCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement;

// Main buttons
const singleBtn = document.getElementById("single") as HTMLButtonElement;
const multiBtn = document.getElementById("multi") as HTMLButtonElement;
const coopBtn = document.getElementById("coop") as HTMLButtonElement;

// Submenus
const singleMenu = document.getElementById("single-menu") as HTMLDivElement;
const multiMenu = document.getElementById("multi-menu") as HTMLDivElement;
const coopMenu = document.getElementById("coop-menu") as HTMLDivElement;

// Submenu buttons
const classicBtn = document.getElementById("classic") as HTMLButtonElement;
const infinityBtn = document.getElementById("infinity") as HTMLButtonElement;

// 🟢 STATE TRACKING:
// Main buttons are always `visible` & `clickable`
// Submenus are initially `hidden` & `not clickable`
// When expanded: `visible` & `clickable`

// Function to toggle submenus
function toggleMenu(selectedMenu: HTMLDivElement) {
    console.log("Toggling menu:", selectedMenu.id);

    // 🟠 Collapse all other submenus before expanding the clicked one
    document.querySelectorAll(".submenu").forEach((menu) => {
        if (menu !== selectedMenu) {
            menu.classList.remove("expanded"); // 🔴 Make `hidden`
        }
    });

    // 🟢 Toggle the clicked submenu
    if (selectedMenu.classList.contains("expanded")) {
        console.log("Menu is already expanded, collapsing...");
        selectedMenu.classList.remove("expanded"); // 🔴 Make `hidden`
    } else {
        console.log("Expanding menu...");
        selectedMenu.classList.add("expanded"); // 🟢 Make `visible`
    }
}

// 📌 Collapse menus when clicking outside
document.addEventListener("click", (event) => {
    const isInsideMenu = (event.target as HTMLElement).closest("#menu");

    if (!isInsideMenu) {
        console.log("Click outside, collapsing menus.");
        document.querySelectorAll(".submenu").forEach(menu => menu.classList.remove("expanded")); // 🔴 Make `hidden`
    }
});

// 🟢 Add event listeners for toggling submenus
singleBtn.addEventListener("click", () => toggleMenu(singleMenu));
multiBtn.addEventListener("click", () => toggleMenu(multiMenu));
coopBtn.addEventListener("click", () => toggleMenu(coopMenu));

// 🎮 Game Mode Listeners
classicBtn.addEventListener("click", (event) => {
    event.stopPropagation(); // 🔵 Prevent closing the menu
    console.log("🔥 Classic button clicked! Starting game...");

    // 🟠 Hide menu, show game
    menu.classList.add("hidden"); // 🔴 Make `hidden`
    gameCanvas.classList.remove("hidden"); // 🟢 Make `visible`
    gameCanvas.classList.add("visible"); // ✅ Ensure it's fully displayed

    startSingleClassic(); // ✅ Start game
});
