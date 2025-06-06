import { showToast, userInfo } from '../../utils';
import { playSound, sounds, stopSound } from './audio';
import { clearLobbyId } from './lobbyClient';
import { chooseView, drawGameMessage, updateScoreboard } from './renderUtils';
import { gameCanvas, ctx, initGameCanvas } from './renderUtils'

const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 10;

let currentPlayerId: number = 0;
let players: { username: string; userId: number; posiY: number; posiX: number; score: number }[] = [];
let ball = { x: 800, y: 600 };
let gameStarted = false;
let localUsername: string = "";

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

		switch (data.type) {
			case "welcome":
				console.log("🎉 Welcome recebido:", data);
				currentPlayerId = data.playerId;
				data.role = role;
				break;

			case "countdown":
				gameStarting = true;
				drawGameMessage(true, data.value.toString(), "green");
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
					}, 100);
				}
				break;

			case "update":
				if (!gameStarted && !gameStarting) {
					chooseView('game');
					gameStarted = true;
				}

				localUsername = data.you;
				players = data.state.players;
				role = data.state.role;
				currentPlayerId = players.find(p => p.username === localUsername)?.userId ?? 0;
				ball = data.state.ball;
				drawGame();
				break;

			case "scoreboard":
				players = data.players;
				updateScoreboard(players);
				break;

			case "player-disconnected":
				showToast.red(`⚠️ ${data.username} foi desconectado`);
				break;

			case "end":
				if (gameEnded) break;
				gameEnded = true;
				drawGameMessage(
					true,
					`${data.winner} wins!`,
					data.winner === (window as any).appUser?.user_name ? "blue" : "red"
				);
				setTimeout(() => {
					chooseView('menu');
					drawGameMessage(false);
					clearLobbyId();
					gameStarted = false;
					gameStarting = false;
					gameEnded = false;

					if ((window as any).appUser?.user_set_sound === 1) {
						stopSound("gameMusic");
						sounds.menuMusic.play().catch(() => {});
					}
				}, 5000);
				break;

			default:
				console.warn("🔍 Evento desconhecido:", data.type);
		}
	};
	userInfo.match_sock!.onclose = () => {
		console.log("❌ Socket do jogo foi encerrado");
		showToast.red("Disconnected from match");
	};
}

