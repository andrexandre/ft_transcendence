const SERVER_URL = "ws://127.0.0.1:5000/ws";

export let gameCanvas: HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D;

export function initGameCanvas() {
	gameCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
	ctx = gameCanvas.getContext("2d")!;
	gameCanvas.width = 800;
	gameCanvas.height = 600;
};

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;

let socket: WebSocket;
let currentPlayerId = "";
let players: { id: string; position: number }[] = [];
let ball = { x: 400, y: 300 };
let gameStarted = false;

function GameMessageVisibility(visible: string) {
	const el = document.getElementById("game-message") as HTMLDivElement;
	el.classList.toggle("hidden", visible !== "show");
}

function drawGameMessage(msg: string, color?: string) {
	const el = document.getElementById("game-message") as HTMLDivElement;
	el.textContent = msg;
	if (color) el.style.color = color;
	el.classList.remove("hidden");
}

function updateScoreboard(players: any[], ball: any) {
	const el = document.getElementById("scoreboard") as HTMLDivElement;
	const score = `${players[0]?.username ?? "Player1"} vs ${players[1]?.username ?? "Player2"}`;
	el.innerHTML = `<span style='color:blue;'>${score}</span>  |  Ball: ${ball.x.toFixed(1)}, ${ball.y.toFixed(1)}`;
	el.style.display = "block";
}

function drawGame() {
	ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

	ctx.fillStyle = "#ccc";
	ctx.fillRect(gameCanvas.width / 2 - 1, 0, 2, gameCanvas.height);

	players.forEach((p, i) => {
		const x = i === 0 ? 30 : gameCanvas.width - 40;
		const y = (p.position / 100) * (gameCanvas.height - PADDLE_HEIGHT);
		ctx.fillStyle = p.id === currentPlayerId ? "#4ade80" : "#f87171";
		ctx.fillRect(x, y, PADDLE_WIDTH, PADDLE_HEIGHT);
	});

	ctx.fillStyle = "#3b82f6";
	ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);

	updateScoreboard(players, ball);
}

function setupControls() {
	document.addEventListener("keydown", (e) => {
		if (!socket || socket.readyState !== WebSocket.OPEN) return;
		if (e.key === "ArrowUp") socket.send(JSON.stringify({ type: "move", direction: "up" }));
		if (e.key === "ArrowDown") socket.send(JSON.stringify({ type: "move", direction: "down" }));
	});
}

function hideMainMenuAndShowCanvas() {
	document.getElementById("game-main-menu")?.classList.add("hidden");
	document.getElementById("gameCanvas")?.classList.remove("hidden");
	document.getElementById("scoreboard")!.style.display = "block";
}

function connectWebSocket(username: string) {
	socket = new WebSocket(SERVER_URL);
	console.log("📡 Connecting to", SERVER_URL);

	socket.onopen = () => {
		console.log("✅ Connected to server");
		socket.send(JSON.stringify({ type: "join", username }));
	};

	socket.onmessage = (event) => {
		const data = JSON.parse(event.data);
		console.log("📩 Message from server:", data);

		if (data.type === "welcome") {
			currentPlayerId = data.playerId;
			console.log("🎮 Player ID:", currentPlayerId);
		}

		if (data.type === "update") {
			if (!gameStarted) {
				gameStarted = true;
				GameMessageVisibility("hide");
				hideMainMenuAndShowCanvas();
			}
			players = data.state.players;
			ball = data.state.ball;
			drawGame();
		}

		if (data.type === "full") {
			alert("⚠ Server full. Try again later.");
		}
	};

	socket.onerror = (err) => console.error("Socket error:", err);
}

export function startGameClient() {
	const username = sessionStorage.getItem("username") || "Guest";
	initGameCanvas();
	connectWebSocket(username);
	setupControls();
	drawGameMessage("Waiting for another player...", "gray");
	GameMessageVisibility("show");
}