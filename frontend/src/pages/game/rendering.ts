import { WebSocket } from "vite";

export let gameCanvas: HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D;


// // rendering.ts
// export function initGameCanvas(socket: WebSocket, player: "left" | "right") {
// 	console.log("🎮 Canvas started as:", player);
	
// 	ctx.fillStyle = player === "left" ? "blue" : "red";
// 	ctx.fillRect(10, 10, 50, 50);
// }



export function initGameCanvas() {
	gameCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
	ctx = gameCanvas.getContext("2d")!;
	gameCanvas.width = 800;
	gameCanvas.height = 600;
};
