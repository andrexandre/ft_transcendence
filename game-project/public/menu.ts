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
const submenus = [singleMenu, multiMenu, coopMenu];

// Submenu buttons
const classicBtn = document.getElementById("classic") as HTMLButtonElement;
const infinityBtn = document.getElementById("infinity") as HTMLButtonElement;

function toggleMenu(selectedMenu: HTMLDivElement) {
  console.log("Toggling menu:", selectedMenu.id);

  // Close all submenus before opening the selected one
  const allSubmenus = document.querySelectorAll(".submenu");
  allSubmenus.forEach((menu) => {
      if (menu !== selectedMenu) {
          menu.classList.remove("expanded");
      }
  });

  // Toggle only the selected menu
  if (selectedMenu.classList.contains("expanded")) {
      console.log("Menu is already expanded, collapsing...");
      selectedMenu.classList.remove("expanded");
  } else {
      console.log("Expanding menu...");
      selectedMenu.classList.add("expanded");
  }
}

// 📌 Collapse menus when clicking outside
document.addEventListener("click", (event) => {
  const isInsideMenu = (event.target as HTMLElement).closest("#menu");
  
  if (!isInsideMenu) {
      console.log("Click outside, collapsing menus.");
      document.querySelectorAll(".submenu").forEach(menu => menu.classList.remove("expanded"));
  }

  classicBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    console.log("🔥 Classic button clicked! Starting game...");

    menu.classList.add("hidden");
    gameCanvas.classList.remove("hidden");
    gameCanvas.classList.add("visible");

    startSingleClassic();  // ✅ Ensure this runs
});

});
