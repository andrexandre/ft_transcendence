import { clearLobbyId } from './lobbyClient'; 
import { state as tournamentState, renderTournamentBracket, handleEndTournament, showRoundTransition } from './tournamentRender';

export let gameCanvas: HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D;

const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 10;

let currentPlayerId: number = 0;
let players: { username: string; userId: number; posiY: number; posiX: number; score: number }[] = [];
let ball = { x: 800, y: 600 };
let gameStarted = false;
let matchSocket: WebSocket;
let localUsername: string = "";



export function initGameCanvas() {
	gameCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
	ctx = gameCanvas.getContext("2d")!;
	gameCanvas.width = 800;
	gameCanvas.height = 600;
}

function drawGameMessage(msg: string, color?: string) {
	const el = document.getElementById("game-message") as HTMLDivElement;
	el.textContent = msg;
	if (color) el.style.color = color;
	el.classList.remove("hidden");
}

function GameMessageVisibility(show: boolean) {
	const el = document.getElementById("game-message") as HTMLDivElement;
	el.classList.toggle("hidden", !show);
}

function updateScoreboard(players: any[]) {
	const el = document.getElementById("scoreboard") as HTMLDivElement;
	if (players.length < 2) return;
	const [p1, p2] = players;
	el.innerHTML = /*html*/`
		<div class="grid grid-cols-[1fr_15rem_1fr]">
			<div class="text-right truncate" style='color: blue;'>${p1.username}</div>
			<div class="text-center">${p1.score} vs ${p2.score}</div>
			<div class="text-left truncate" style='color: red;'>${p2.username}</div>
		</div>
	`;
}

function drawGame() {
	ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

	const gradient = ctx.createLinearGradient(0, 0, 0, gameCanvas.height);
	gradient.addColorStop(0, "transparent");
	gradient.addColorStop(0.5, "green");
	gradient.addColorStop(1, "transparent");
	ctx.fillStyle = gradient;
	ctx.fillRect(gameCanvas.width / 2 - 1, 0, 2, gameCanvas.height);

	players.forEach((p) => {
		const x = (p.posiX / 100) * (gameCanvas.width - paddleWidth);
		const y = (p.posiY / 100) * (gameCanvas.height - paddleHeight);

		ctx.fillStyle = p.posiX === 0 ? "blue" : "red";
		ctx.fillRect(x, y, paddleWidth, paddleHeight);
	});

	ctx.fillStyle = "green";
	ctx.beginPath();
	ctx.arc(ball.x + ballSize / 2, ball.y + ballSize / 2, ballSize / 2, 0, Math.PI * 2);
	ctx.fill();

	updateScoreboard(players);
}

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
		if (!matchSocket || matchSocket.readyState !== WebSocket.OPEN) return;

		const now = Date.now();
		if (now - lastMoveTime < speedDelay) return;

		if (keysPressed["ArrowUp"]) {
		matchSocket.send(JSON.stringify({ type: "move", direction: "up" }));
		lastMoveTime = now;
		}
		if (keysPressed["ArrowDown"]) {
		matchSocket.send(JSON.stringify({ type: "move", direction: "down" }));
		lastMoveTime = now;
		}
	}, 1000 / 60);
}

function hideMenuShowCanvas() {
	document.getElementById("game-main-menu")?.classList.add("hidden");
	document.getElementById("gameCanvas")?.classList.remove("hidden");
	document.getElementById("scoreboard")!.style.display = "block";
}

export function connectToMatch(socket: WebSocket, role: "left" | "right") {
	matchSocket = socket;
	hideMenuShowCanvas();
	initGameCanvas();
	setupControls();

	let gameStarting = false;
	let gameEnded = false;

	console.log("🎮 Socket conectado → preparando canvas");

	matchSocket.onmessage = (event) => {
		const data = JSON.parse(event.data);

		if (data.type === "welcome") {
			console.log("🎉 Welcome recebido:", data);
			currentPlayerId = data.playerId;
			role = data.role; //???
			return;
		}
		
		if (data.type === "countdown") {
			gameStarting = true;
			GameMessageVisibility(true);
			drawGameMessage(data.value.toString(), "green");
			if (data.value === 1) {
				setTimeout(() => {
					GameMessageVisibility(false);
					if (!gameStarted) {
						hideMenuShowCanvas();
						gameStarted = true;
						console.log("🟢 Jogo marcado como iniciado");
					}
				}, 1000);
			}
			return;
		}
		
		if (data.type === "update") {
			if (!gameStarted && !gameStarting) {
				hideMenuShowCanvas();
				gameStarted = true;
			}
			
			localUsername = data.you;
			console.log("🟢🟢🟢🟢:", localUsername);
			players = data.state.players;
			role = data.state.role;
			currentPlayerId = players.find(p => p.username === localUsername)?.userId ?? 0;
			ball = data.state.ball;
			drawGame();
			return;
		}
		
		if (data.type === "scoreboard") {
			players = data.players;
			updateScoreboard(players);
			return;
		}
		
		if (data.type === "show-bracket") {
			renderTournamentBracket();
			return;
		}

		if (data.type === "end-round") {
			renderTournamentBracket();
			tournamentState.rounds[data.roundIndex][data.matchIndex].winner = data.winner;
			return;
		}
		
		if (data.type === "end-tournament") {
			handleEndTournament(data.winner);
			return;
		}

		if (data.type === "start-round") {
			showRoundTransition(data.round);
			return;
		}
		
		if (data.type === "end" && !gameEnded) {
			gameEnded = true;
			drawGameMessage(`${data.winner} wins!`, data.winner === (window as any).appUser?.user_name ? "blue" : "red");
			GameMessageVisibility(true);
			setTimeout(() => {
				document.getElementById("gameCanvas")?.classList.add("hidden");
				document.getElementById("game-main-menu")?.classList.remove("hidden");
				document.getElementById("scoreboard")!.style.display = "none";
				GameMessageVisibility(false);
				document.getElementById("sidebar")?.classList.remove("hidden");

				clearLobbyId(); // test
				gameStarted = false;
				gameStarting = false;
				gameEnded = false;
			}, 5000);
			return;
		}
	};

	matchSocket.onclose = () => {
		console.log("❌ Socket do jogo foi encerrado");
		GameMessageVisibility(true);
		drawGameMessage("Disconnected from match", "red");
	};
}