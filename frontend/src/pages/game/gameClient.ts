// import { playSound, playMusic, stopAllMusic } from "./soundManager";

const SERVER_URL = "ws://127.0.0.1:5000/ws";

export let gameCanvas: HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D;

export function initGameCanvas() {
	gameCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
	ctx = gameCanvas.getContext("2d")!;
	gameCanvas.width = 800;
	gameCanvas.height = 600;
};

const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 10;

let socket: WebSocket;
let currentPlayerId = "";
let players: { username: string; userId: number; posiY: number; posiX: number; score: number }[] = [];
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
	if (players.length < 2) return;

	const p1 = players[0];
	const p2 = players[1];

	el.innerHTML = `
		<span style='color: blue;'>${p1.username}</span>
		<b>${p1.score}</b> 
		vs 
		<b>${p2.score}</b> 
		<span style='color: red;'>${p2.username}</span>
		<br>
	`;
	el.style.display = "block";
}

function drawGame() {
	ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

	// draw canvas
	ctx.fillStyle = "green";
	ctx.fillRect(gameCanvas.width / 2 - 1, 0, 2, gameCanvas.height);

	// draw paddles
	players.forEach((p) => {
		const x = (p.posiX / 100) * (gameCanvas.width - paddleWidth);
		const y = (p.posiY / 100) * (gameCanvas.height - paddleHeight);
		ctx.fillStyle = p.userId.toString() === currentPlayerId ? "blue" : "red";
		ctx.fillRect(x, y, paddleWidth, paddleHeight);
	});
	
	// draw ball
	ctx.fillStyle = "green";
	ctx.beginPath();
	ctx.arc(ball.x + ballSize / 2, ball.y + ballSize / 2, ballSize / 2, 0, Math.PI * 2);
	ctx.fill();

	updateScoreboard(players, ball);
}

/// Need to correct the diference between smouth and speed
function setupControls() {
	const keysPressed: Record<string, boolean> = {};
	let lastMoveTime = 0;
	const speedDelay = 25;

	document.addEventListener("keydown", (e) => {
		keysPressed[e.key] = true;
	});

	document.addEventListener("keyup", (e) => {
		keysPressed[e.key] = false;
	});

	setInterval(() => {
		if (!socket || socket.readyState !== WebSocket.OPEN) return;

		const now = Date.now();
		if (now - lastMoveTime < speedDelay) return;

		if (keysPressed["ArrowUp"]) {
			socket.send(JSON.stringify({ type: "move", direction: "up" }));
			lastMoveTime = now;
			// playSound("paddleHit"); ///test
		}
		if (keysPressed["ArrowDown"]) {
			socket.send(JSON.stringify({ type: "move", direction: "down" }));
			lastMoveTime = now;
		}
	}, 1000 / 60);
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
		const userId = parseInt(sessionStorage.getItem("user_id") || "0");

		socket.send(JSON.stringify({
			type: "join",
			username,
			userId,
		}));
	};

	socket.onmessage = (event) => {
		const data = JSON.parse(event.data);
		if (data.type === "startGame") {
			console.log("📩 Received 'startGame' WebSocket message");
			startGameClient(); 
		}
		
		if (data.type === "welcome") {
			currentPlayerId = data.playerId;
			console.log("🎮 Player ID:", currentPlayerId);
		}
		
		if (data.type === "countdown") {
			drawGameMessage(data.value.toString(), "green");
			if (data.value === 1) {
				// playSound("countdown"); /// TEEEEEEEEEEEEEEEEEEESSSSSSSSSTT
				setTimeout(() => GameMessageVisibility("hide"), 1000);
			}
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
		
		if (data.type === "end") {
			const winner = data.winner;
			drawGameMessage(`${winner} wins!`, winner === username ? "blue" : "red");
			GameMessageVisibility("show");
		
			setTimeout(() => {
				document.getElementById("gameCanvas")?.classList.add("hidden");
				document.getElementById("game-main-menu")?.classList.remove("hidden");
				document.getElementById("scoreboard")!.style.display = "none";
				GameMessageVisibility("hide");
				document.getElementById('sidebar')?.classList.toggle('hidden');
			}, 5000);
		}

		if (data.type === "full") {
			alert("⚠ Server full. Try again later.");
		}
	};

	socket.onerror = (err) => console.error("Socket error:", err);
	socket.onclose = () => {
		console.log("❌ Disconnected from server");
		socket = null!;
		gameStarted = false;
		GameMessageVisibility("show");
		drawGameMessage("Disconnected from server", "red");
	}
}

export function startGameClient() {
	const username = sessionStorage.getItem("username") || "Guest";
	initGameCanvas();
	connectWebSocket(username);
	setupControls();
	drawGameMessage("Waiting for another player...", "gray");
	GameMessageVisibility("show");
	// playMusic("gameMusic");
}