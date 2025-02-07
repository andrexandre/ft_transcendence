import { startSinglePlayerGame } from "./game.js";

const menu = document.getElementById("menu") as HTMLDivElement;
const singleButton = document.getElementById("single") as HTMLButtonElement;
const gameCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement;

singleButton.addEventListener("click", () => {
  menu.classList.add("hidden");
  gameCanvas.classList.remove("hidden");
  gameCanvas.classList.add("visible");
  startSinglePlayerGame();
});
