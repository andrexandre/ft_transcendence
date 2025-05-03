// src/matchManager.ts
import { getLobbyByGameId, removeLobbyByGameId } from './lobbyManager.js';
import { updateBotPlayer } from './bot.js';
import { saveMatchToDatabase } from './userSet.js';

const winningScore = 2;

interface PlayerState {
id: number;
username: string;
posiY: number;
posiX: number;
score: number;
}

export type MatchState = {
gameId: string;
players: PlayerState[];
ball: { x: number; y: number; dx: number; dy: number };
interval: NodeJS.Timeout;
paused: boolean;
isSinglePlayer: boolean;
gameMode: string;
};

const matches = new Map<string, MatchState>();
const matchSockets = new Map<string, WebSocket[]>();

export function handleMatchConnection(gameId: string, connection: any) {
const lobby = getLobbyByGameId(gameId);
if (!lobby) {
	console.log(`❌ Lobby not found for gameId: ${gameId}`);
	connection.send(JSON.stringify({ type: "error", message: "Lobby not found" }));
	connection.close();
	return;
}

const players = lobby.players;
const isSingle = players.length === 1;
const gameMode = lobby.gameMode;

let realPlayers = players.map((p, index) => ({
	id: p.userId,
	username: p.username,
	posiY: 50,
	posiX: index === 0 ? 0 : 100,
	score: 0
}));

if (isSingle) {
	realPlayers.push({
	id: 9999,
	username: "BoTony",
	posiY: 50,
	posiX: 100,
	score: 0
	});
}

if (!matchSockets.has(gameId)) {
	matchSockets.set(gameId, []);
	console.log(`🌟 Sala criada para jogo ${gameId}`);
}

const socketArray = matchSockets.get(gameId)!;
const index = socketArray.length;
socketArray.push(connection);
console.log(`👥 Total de sockets no jogo ${gameId}: ${socketArray.length}`);

if (!matches.has(gameId)) {
	const matchState: MatchState = {
	gameId,
	players: realPlayers,
	ball: { x: 400, y: 300, dx: 3, dy: 3 },
	paused: true,
	isSinglePlayer: isSingle,
	gameMode,
	interval: setInterval(() => updateMatchState(gameId), 1000 / 60)
	};
	matches.set(gameId, matchState);
	startCountdown(gameId);
	console.log(`🧐 Estado inicial criado para jogo ${gameId}`);
}

const user = connection.user;
if (user) {
	connection.send(JSON.stringify({
	type: "welcome",
	playerId: user.userId,
	username: user.username
	}));
}

connection.on("message", (msg: string) => {
	try {
	const data = JSON.parse(msg.toString());
	const match = matches.get(gameId);
	if (!match) return;

	const player = match.players[index];
	if (!player) return;

	if (data.type === "move") {
		if (data.direction === "up") {
		player.posiY = Math.max(0, player.posiY - 3);
		} else if (data.direction === "down") {
		player.posiY = Math.min(100, player.posiY + 3);
		}
	}
	} catch (err) {
	console.error("❌ Invalid message:", err);
	connection.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
	}
});

connection.on("close", () => {
	console.log(`❌ Player desconectado do jogo ${gameId}`);
	const sockets = matchSockets.get(gameId)?.filter((c) => c !== connection);
	if (!sockets || sockets.length === 0) {
	matchSockets.delete(gameId);
	const match = matches.get(gameId);
	if (match) clearInterval(match.interval);
	matches.delete(gameId);
	removeLobbyByGameId(gameId);
	console.log(`🧹 Match ${gameId} limpo (todos os jogadores saíram)`);
	} else {
	matchSockets.set(gameId, sockets);
	console.log(`👥 Jogadores restantes: ${sockets.length}`);
	}
});
}

function updateMatchState(gameId: string) {
	const match = matches.get(gameId);
	if (!match || match.paused) return;

	if (match.isSinglePlayer) {
		updateBotPlayer(match);
	}

	match.ball.x += match.ball.dx;
	match.ball.y += match.ball.dy;

	if (match.ball.y <= 0 || match.ball.y >= 590) match.ball.dy *= -1;

	match.players.forEach((player) => {
		const paddleX = (player.posiX / 100) * 790;
		const paddleY = (player.posiY / 100) * 520;

		if (
		match.ball.x >= paddleX &&
		match.ball.x <= paddleX + 10 &&
		match.ball.y >= paddleY &&
		match.ball.y <= paddleY + 80
		) {
		match.ball.dx *= -1;
		const impact = (match.ball.y - paddleY - 40) / 40;
		match.ball.dy += impact * 2;
		}
	});

	if (match.ball.x < 0) {
		match.players[1].score++;
		if (match.players[1].score >= winningScore) {
		match.paused = true;
		sendCountdown(matchSockets.get(gameId));
		setTimeout(() => endMatch(gameId, match.players[1].username), 4000);
		} else {
		resetBall(gameId);
		}
		return;
	}

	if (match.ball.x > 800) {
		match.players[0].score++;
		if (match.players[0].score >= winningScore) {
		match.paused = true;
		sendCountdown(matchSockets.get(gameId));
		setTimeout(() => endMatch(gameId, match.players[0].username), 4000);
		} else {
		resetBall(gameId);
		}
		return;
	}

	const sockets = matchSockets.get(gameId);
	if (!sockets) return;

	sockets.forEach((sock, i) => {
		const player = match.players[i];
		if (sock.readyState === sock.OPEN) {
		sock.send(
			JSON.stringify({
			type: "update",
			you: player.username,
			state: {
				players: match.players,
				ball: { x: match.ball.x, y: match.ball.y }
			}
			})
		);
		}
	});
}

export function startCountdown(gameId: string) {
	const match = matches.get(gameId);
	const sockets = matchSockets.get(gameId);
	if (!match || !sockets) return;

	match.paused = true;
	let count = 3;

	const countdown = setInterval(() => {
		sockets.forEach((sock) => {
		if (sock.readyState === sock.OPEN) {
			sock.send(JSON.stringify({ type: "countdown", value: count }));
		}
		});
		count--;
		if (count === 0) {
		clearInterval(countdown);
		match.paused = false;
		}
	}, 1000);
}

function endMatch(gameId: string, winner: string) {
	const match = matches.get(gameId);
	const sockets = matchSockets.get(gameId);
	if (!match || !sockets) return;

	sockets.forEach(sock => {
		if (sock.readyState === sock.OPEN) {
		sock.send(JSON.stringify({
			type: "end",
			winner,
			players: match.players,
			gameMode: match.gameMode
		}));
		}
	});

	saveMatchToDatabase(match);

	clearInterval(match.interval);
	matches.delete(gameId);
	matchSockets.delete(gameId);
	removeLobbyByGameId(gameId);
	console.log(`🌟 Match ${gameId} terminado. WINNER: ${winner}`);
}


function sendCountdown(sockets: WebSocket[] | undefined) {
	if (!sockets) return;
	let count = 3;
	const interval = setInterval(() => {
		sockets.forEach((sock) => {
		if (sock.readyState === sock.OPEN)
			sock.send(JSON.stringify({ type: "countdown", value: count }));
		});
		count--;
		if (count === 0) clearInterval(interval);
	}, 1000);
}

function resetBall(gameId: string) {
	const match = matches.get(gameId);
	if (!match) return;

	match.ball = { x: 400, y: 300, dx: 3, dy: 3 };
	startCountdown(gameId);
}
