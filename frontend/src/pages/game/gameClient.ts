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

let waiting = true;


function drawWaiting() {
	ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
	ctx.fillStyle = "#ccc";
	ctx.font = "36px Arial";
	ctx.fillText("Waiting for another player...", 200, 300);
	requestAnimationFrame(drawWaiting);
}

function drawGame() {
	ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

	players.forEach((p, i) => {
		const x = i === 0 ? 30 : gameCanvas.width - 40;
		const y = (p.position / 100) * (gameCanvas.height - PADDLE_HEIGHT);
		ctx.fillStyle = p.id === currentPlayerId ? "#4ade80" : "#f87171";
		ctx.fillRect(x, y, PADDLE_WIDTH, PADDLE_HEIGHT);
	});

	ctx.fillStyle = "#3b82f6";
	ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);

	requestAnimationFrame(drawGame);
}

function setupControls() {
	document.addEventListener("keydown", (e) => {
		if (!socket || socket.readyState !== WebSocket.OPEN) return;
		if (e.key === "ArrowUp") socket.send(JSON.stringify({ type: "move", direction: "up" }));
		if (e.key === "ArrowDown") socket.send(JSON.stringify({ type: "move", direction: "down" }));
	});
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
			waiting = false;
			players = data.state.players;
			ball = data.state.ball;
		}

		if (data.type === "full") {
			alert("⚠ Server full. Try again later.");
		}
	};

	socket.onerror = (err) => console.error("Socket error:", err);
}

export function startGameClient() {
	const username = sessionStorage.getItem("username") || "Guest";
	connectWebSocket(username);
	setupControls();
	drawWaiting();
	setTimeout(() => {
		const waitLoop = () => {
			if (!waiting) drawGame();
			else requestAnimationFrame(waitLoop);
		};
		waitLoop();
	}, 2000);
}
