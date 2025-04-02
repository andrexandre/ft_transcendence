// // 📌 File: /trans/frontend/src/pages/game/gameRender.ts

// import * as lib from "../../utils";

// const socket = new WebSocket("ws://localhost:5000/ws");

// const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
// const ctx = canvas?.getContext("2d");

// // canvas.width = 800;
// // canvas.height = 400;

// let paddles = {
//     player1: { x: 20, y: 150, width: 10, height: 80 },
//     player2: { x: 770, y: 150, width: 10, height: 80 },
// };

// export function startMultiplayer() {
//     const username = sessionStorage.getItem("username") || "Player";

//     socket.onopen = () => {
//         lib.showToast("✅ Connected to server!");
//         socket.send(JSON.stringify({ type: "join", player: username }));
//     };

//     socket.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         if (data.type === "update") {
//             paddles = data.state.paddles;
//             drawGame();
//         }
//     };

//     document.addEventListener("keydown", (e) => {
//         if (e.key === "ArrowUp") socket.send(JSON.stringify({ type: "move", direction: "up" }));
//         if (e.key === "ArrowDown") socket.send(JSON.stringify({ type: "move", direction: "down" }));
//     });

//     lib.showToast("🎮 Multiplayer game started!");
//     canvas.classList.remove("hidden"); // Show canvas
//     drawGame();
// }

// function drawGame() {
//     if (!ctx) return;

//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     // Draw paddles
//     ctx.fillStyle = "white";
//     ctx.fillRect(paddles.player1.x, paddles.player1.y, paddles.player1.width, paddles.player1.height);
//     ctx.fillRect(paddles.player2.x, paddles.player2.y, paddles.player2.width, paddles.player2.height);
// }
