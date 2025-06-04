import { showToast, userInfo } from '../../utils';
// import { Logger } from '../utils';
import { playSound, sounds, stopSound } from './audio';
import { clearLobbyId } from './lobbyClient';
import { chooseView, drawGameMessage } from './renderUtils';

export let gameCanvas: HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D;

const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 10;

let currentPlayerId: number = 0;
let players: { username: string; userId: number; posiY: number; posiX: number; score: number }[] = [];
let ball = { x: 800, y: 600 };
let gameStarted = false;
// let userInfo.match_sock: WebSocket;
let localUsername: string = "";

export function initGameCanvas() {
	gameCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
	ctx = gameCanvas.getContext("2d")!;
	gameCanvas.width = 800;
	gameCanvas.height = 600;
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
		ctx.fillStyle = p.posiX < 50 ? "blue" : "red";

		if (p.userId === currentPlayerId) {
			ctx.strokeStyle = "white";
			ctx.lineWidth = 3;
			ctx.strokeRect(x, y, paddleWidth, paddleHeight);
		}

		ctx.fillRect(x, y, paddleWidth, paddleHeight);
	});

	ctx.fillStyle = "green";
	ctx.beginPath();
	ctx.arc(ball.x + ballSize / 2, ball.y + ballSize / 2, ballSize / 2, 0, Math.PI * 2);
	ctx.fill();

	updateScoreboard(players);
}

export function updateScoreboard(players: any[]) {
	const el = document.getElementById("scoreboard") as HTMLDivElement;
	if (players.length < 2) return;
	if (players.length == 4) {
		const teamA = players.slice(0, 2);
		const teamB = players.slice(2, 4);
		const scoreA = teamA.reduce((acc, p) => acc + p.score, 0);
		const scoreB = teamB.reduce((acc, p) => acc + p.score, 0);
		el.innerHTML = /*html*/`
			<div class="grid grid-cols-[1fr_15rem_1fr] space-y-1">
				<div class="text-right truncate" style='color: blue;'>Team 1</div>
				<div class="text-center">${scoreA} vs ${scoreB}</div>
				<div class="text-left truncate" style='color: red;'>Team 2</div>
				<div class="text-right text-sm">${teamA.map(p => p.username).join(', ')}</div>
				<div class="text-center"></div>
				<div class="text-left text-sm">${teamB.map(p => p.username).join(', ')}</div>
			</div>
		`;
	} else {
		const [p1, p2] = players;
		el.innerHTML = /*html*/`
			<div class="grid grid-cols-[1fr_15rem_1fr]">
				<div class="text-right truncate" style='color: blue;'>${p1.username}</div>
				<div class="text-center">${p1.score} vs ${p2.score}</div>
				<div class="text-left truncate" style='color: red;'>${p2.username}</div>
			</div>
		`;
	}
}

let isKeySetup = false;

function setupControls() {
	const keysPressed: Record<string, boolean> = {};
	let lastMoveTime = 0;
	const speedDelay = 25;

	if (!isKeySetup) {
		isKeySetup = true;
		document.addEventListener("keydown", (e) => {
			keysPressed[e.key] = true;
		});
		document.addEventListener("keyup", (e) => {
			keysPressed[e.key] = false;
		});
	}

	setInterval(() => {
		if (!userInfo.match_sock || userInfo.match_sock.readyState !== WebSocket.OPEN) return;

		const now = Date.now();
		if (now - lastMoveTime < speedDelay) return;

		if (keysPressed["ArrowUp"]) {
			userInfo.match_sock.send(JSON.stringify({ type: "move", direction: "up" }));
			lastMoveTime = now;
		}
		if (keysPressed["ArrowDown"]) {
			userInfo.match_sock.send(JSON.stringify({ type: "move", direction: "down" }));
			lastMoveTime = now;
		}
	}, 1000 / 60);
}

export function connectToMatch(role: "left" | "right") {
	
	chooseView('game');
	initGameCanvas();
	setupControls();

	let gameStarting = false;
	let gameEnded = false;

	console.log("🎮 Socket conectado → preparando canvas");

	userInfo.match_sock!.onmessage = (event) => {
		const data = JSON.parse(event.data);

		if (data.type === "welcome") {
			console.log("🎉 Welcome recebido:", data);
			currentPlayerId = data.playerId;
			data.role = role; //???
			return;
		}

		if (data.type === "countdown") {
			gameStarting = true;
			drawGameMessage(true, data.value.toString(), "green");
			// add som
			if ((window as any).appUser?.user_set_sound === 1) {
				playSound("countdown");
			}
			if (data.value === 1) {
				setTimeout(() => {
					drawGameMessage(false);
					if (!gameStarted) {
						chooseView('game');
						gameStarted = true;
						console.log("🟢 Jogo marcado como iniciado");
					}
				}, 1000);
			}
			return;
		}

		if (data.type === "update") {
			if (!gameStarted && !gameStarting) {
				chooseView('game');
				gameStarted = true;
			}

			localUsername = data.you;
			// console.log("🟢🟢🟢🟢:", localUsername);
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

		if (data.type === "player-disconnected") {
			showToast.red(`⚠️ ${data.username} foi desconectado`);
		}

		if (data.type === "end" && !gameEnded) {
			gameEnded = true;
			drawGameMessage(true, `${data.winner} wins!`, data.winner === (window as any).appUser?.user_name ? "blue" : "red")
			setTimeout(() => {
				chooseView('menu');
				drawGameMessage(false);

				clearLobbyId();
				gameStarted = false;
				gameStarting = false;
				gameEnded = false;

				// remove som
				if ((window as any).appUser?.user_set_sound === 1) {
					stopSound("gameMusic");
					sounds.menuMusic.play().catch(() => { });
				}
			}, 5000);
			return;
		}
	};

	userInfo.match_sock!.onclose = () => {
		console.log("❌ Socket do jogo foi encerrado");
		showToast.red("Disconnected from match");
	};
}
