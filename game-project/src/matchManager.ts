// src/matchManager.ts
import { getLobbyByGameId, removeLobbyByGameId } from './lobbyManager.js';
import { updateBotPlayer } from './bot.js';
import { saveMatchToDatabase } from './userSet.js';
import { handleMatchEndFromTournament } from './tournamentManager.js';
import { initMTCPlayers, updateMTCGame } from './mtcLogic.js';

const matchDisconnectTimers = new Map<number, NodeJS.Timeout>();
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
	aiDifficulty?: string;
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
	const aiDifficulty = isSingle ? players[0].difficulty || "Normal" : undefined;
	// console.log(`🧑‍🤝‍🧑Not AI: `, aiDifficulty);

	let realPlayers: PlayerState[] = [];
	if (gameMode === "MTC") {
		realPlayers = initMTCPlayers(players);
	} else {
		realPlayers = players.map((p, index) => ({
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
			aiDifficulty,
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
					player.posiY = Math.max(0, player.posiY - 2);
				} else if (data.direction === "down") {
					player.posiY = Math.min(100, player.posiY + 2);
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
			removeLobbyByGameId(gameId); /// check loobbys
			console.log(`🧹 Match ${gameId} limpo (todos os jogadores saíram)`);
		} else {
			matchSockets.set(gameId, sockets);
			console.log(`👥 Jogadores restantes: ${sockets.length}`);
		}
	});
};

function updateMatchState(gameId: string) {
	const match = matches.get(gameId);
	if (!match || match.paused) return;

	if (match.isSinglePlayer) {
		updateBotPlayer(match);
	}

	if (match.gameMode === "MTC") {
		updateMTCGame(match);
	}

	match.ball.x += match.ball.dx;
	match.ball.y += match.ball.dy;

	if (match.ball.y <= 0 || match.ball.y >= 600) match.ball.dy *= -1;

	match.players.forEach((player) => {
		const paddleX = (player.posiX / 100) * 790;
		const paddleY = (player.posiY / 100) * 520;
		if (
			match.ball.x + 10 >= paddleX &&
			match.ball.x <= paddleX + 10 &&
			match.ball.y + 10 >= paddleY &&
			match.ball.y <= paddleY + 80
		) {
			match.ball.dx *= -1;
			const impact = (match.ball.y - paddleY - 40) / 40;
			match.ball.dy += impact * 2;
		}
	});

	const sockets = matchSockets.get(gameId);
	if (!sockets) return;

	if (match.ball.x < 0) {
		match.players[1].score++;
		broadcastScoreboard(sockets, match.players);
		if (match.players[1].score >= winningScore) {
			match.paused = true;
			setTimeout(() => endMatch(gameId), 500);
		} else {
			resetBall(gameId);
		}
		return;
	}

	if (match.ball.x > 800) {
		match.players[0].score++;
		broadcastScoreboard(sockets, match.players);
		if (match.players[0].score >= winningScore) {
			match.paused = true;
			setTimeout(() => endMatch(gameId), 500);
		} else {
			resetBall(gameId);
		}
		return;
	}

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
  
function endMatch(gameId: string) {
	const match = matches.get(gameId);
	const sockets = matchSockets.get(gameId);
	if (!match || !sockets) return;

	const [p1, p2] = match.players;
	const winner = p1.score > p2.score ? p1 : p2;
	const loser = p1.id === winner.id ? p2 : p1;

	broadcastScoreboard(sockets, match.players);

	sockets.forEach(sock => {
	if (sock.readyState === sock.OPEN) {
		sock.send(JSON.stringify({
		type: "end",
		winner: winner.username,
		players: match.players,
		gameMode: match.gameMode
		}));
	}
	});

	saveMatchToDatabase({
	gameMode: match.gameMode, player1Id: p1.id, player2Id: p2.id,
	player1Score: p1.score, player2Score: p2.score, winnerId: winner.id,
	});

	if (match.gameMode === "TNT") {
		handleMatchEndFromTournament(match.gameId, winner.id);
	} else {
		removeLobbyByGameId(gameId);
	}

	clearInterval(match.interval);
	matches.delete(gameId);
	matchSockets.delete(gameId);
	console.log(`🌟 Match ${gameId} terminado. WINNER: ${winner.username}`);
}

function broadcastScoreboard(sockets: WebSocket[], players: PlayerState[]) {
	sockets.forEach((sock) => {
	if (sock.readyState === sock.OPEN) {
		sock.send(JSON.stringify({
		type: "scoreboard",
		players
		}));
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


function resetBall(gameId: string) {
	const match = matches.get(gameId);
	if (!match) return;
	
	const angleOptions = [Math.random() * 90 - 45, Math.random() * 90 + 135];
	const randomAngle = angleOptions[Math.floor(Math.random() * angleOptions.length)];
	
	const angleRad = randomAngle * (Math.PI / 180);

	const minAngle = 45 * (Math.PI / 180);
	const maxAngle = 135 * (Math.PI / 180);
	const angle = minAngle + Math.random() * (maxAngle - minAngle);
  
	const direction = Math.random() > 0.5 ? 1 : -1;
	const speed = 5;
  
	const dx = speed * Math.cos(angleRad);
	const dy = speed * Math.sin(angleRad);
  
	match.ball = { x: 400, y: 300, dx, dy };
	startCountdown(gameId);
  }