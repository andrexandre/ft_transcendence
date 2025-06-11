// // src/matchLogic.ts
// import { updateBotPlayer } from './bot.js';
// import { handleMatchEndFromTournament } from './tournamentManager.js';
// import { saveMatchToDatabase } from './userSet.js';
// import { updateMTCGame, initMTCPlayers } from './mtcLogic.js';
// import { Logger } from './utils.js';
// import { getLobbyByGameId, removeLobbyByGameId } from './lobbyManager.js';

// // Constantes de configuração
// const TABLE_WIDTH = 800;
// const TABLE_HEIGHT = 600;
// const PADDLE_HEIGHT = 80;
// const PADDLE_WIDTH = 10;
// const PLAY_AREA_WIDTH = TABLE_WIDTH - PADDLE_WIDTH;
// const PLAY_AREA_HEIGHT = TABLE_HEIGHT - PADDLE_HEIGHT;
// const BALL_RADIUS = 10;
// export const WINNING_SCORE = 3;

// export const matches = new Map<string, MatchState>();
// export const matchSockets = new Map<string, WebSocket[]>();

// interface PlayerState {
// 	id: number;
// 	username: string;
// 	posiY: number;
// 	posiX: number;
// 	score: number;
// }

// export type MatchState = {
// 	gameId: string;
// 	players: PlayerState[];
// 	ball: { x: number; y: number; dx: number; dy: number };
// 	interval: NodeJS.Timeout;
// 	paused: boolean;
// 	gameMode: string;
// 	aiDifficulty?: string;
// };

// export function initMatchState(lobby: any, gameId: string): MatchState {
// 	const players = lobby.players;
// 	const gameMode = lobby.gameMode;
// 	const aiDifficulty = (gameMode === 'Classic') ? players[0].difficulty || 'Normal' : undefined;

// 	let realPlayers: PlayerState[];
// 	if (gameMode === 'MTC') {
// 		realPlayers = initMTCPlayers(players);
// 	} else {
// 		realPlayers = players.map((p: any, index: number) => ({
// 			id: p.userId,
// 			username: p.username,
// 			posiY: 50,
// 			posiX: index === 0 ? 0 : 100,
// 			score: 0
// 		}));
// 		if (gameMode === 'Classic') {
// 			realPlayers.push({ id: 9999, username: 'BoTony', posiY: 50, posiX: 100, score: 0 });
// 		}
// 	}

// 	return {
// 		gameId,
// 		players: realPlayers,
// 		ball: { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT / 2, dx: 3, dy: 3 },
// 		paused: true,
// 		gameMode,
// 		aiDifficulty,
// 		interval: setInterval(() => updateMatchState(gameId), 1000 / 60)
// 	};
// }

// export function updateMatchState(gameId: string) {
// 	const match = matches.get(gameId);
// 	if (!match || match.paused) return;

// 	if (match.gameMode === 'Classic') updateBotPlayer(match);
// 	if (match.gameMode === 'MTC') updateMTCGame(match);

// 	match.ball.x += match.ball.dx;
// 	match.ball.y += match.ball.dy;
// 	if (match.ball.y <= 0 || match.ball.y >= TABLE_HEIGHT) match.ball.dy *= -1;

// 	match.players.forEach(player => {
// 		const paddleX = (player.posiX / 100) * (TABLE_WIDTH - PADDLE_WIDTH);
// 		const paddleY = (player.posiY / 100) * (TABLE_HEIGHT - PADDLE_HEIGHT);
// 		if (
// 			match.ball.x + BALL_RADIUS >= paddleX &&
// 			match.ball.x <= paddleX + PADDLE_WIDTH &&
// 			match.ball.y + BALL_RADIUS >= paddleY &&
// 			match.ball.y <= paddleY + PADDLE_HEIGHT
// 		) {
// 			match.ball.dx *= -1;
// 			const impact = (match.ball.y - paddleY - PADDLE_HEIGHT / 2) / (PADDLE_HEIGHT / 2);
// 			match.ball.dy += impact * 2;
// 		}
// 	});

// 	const sockets = matchSockets.get(gameId);
// 	if (!sockets) return;

// 	if (handleScore(match, sockets, gameId)) return;

// 	sockets.forEach((sock, i) => {
// 		const player = match.players[i];
// 		if (sock.readyState === sock.OPEN) {
// 			sock.send(JSON.stringify({
// 				type: 'update',
// 				you: player.username,
// 				state: {
// 					players: match.players,
// 					ball: { x: match.ball.x, y: match.ball.y }
// 				}
// 			}));
// 		}
// 	});
// }

// function handleScore(match: MatchState, sockets: WebSocket[], gameId: string): boolean {
// 	if (match.ball.x < 0 || match.ball.x > TABLE_WIDTH) {
// 		const isLeftGoal = match.ball.x < 0;
// 		if (match.gameMode === 'MTC') {
// 			const scoringTeam = isLeftGoal ? match.players.slice(2, 4) : match.players.slice(0, 2);
// 			scoringTeam[0].score++;
// 		} else {
// 			const scorerIndex = match.ball.x > TABLE_WIDTH ? 0 : 1;
// 			match.players[scorerIndex].score++;
// 		}
// 		broadcastScoreboard(sockets, match.players);

// 		const winner = match.players.find(p => p.score >= WINNING_SCORE);
// 		if (winner) {
// 			match.paused = true;
// 			setTimeout(() => endMatch(gameId), 500);
// 		} else {
// 			resetBall(gameId);
// 		}
// 		return true;
// 	}
// 	return false;
// }

// function broadcastScoreboard(sockets: WebSocket[], players: PlayerState[]) {
// 	sockets.forEach(sock => {
// 		if (sock.readyState === sock.OPEN) {
// 			sock.send(JSON.stringify({ type: 'scoreboard', players }));
// 		}
// 	});
// }

// function resetBall(gameId: string) {
// 	const match = matches.get(gameId);
// 	if (!match) return;
// 	const angleRad = (Math.random() * 90 - 45) * (Math.PI / 180);
// 	const speed = 4;
// 	const dx = speed * Math.cos(angleRad);
// 	const dy = speed * Math.sin(angleRad);
// 	match.ball = { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT / 2, dx, dy };
// 	startCountdown(gameId);
// }

// export function endMatch(gameId: string) {
// 	const match = matches.get(gameId);
// 	const sockets = matchSockets.get(gameId);
// 	if (!match || !sockets) return;

// 	const [p1, p2] = match.players;
// 	const winner = p1.score > p2.score ? p1 : p2;

// 	sockets.forEach(sock => {
// 		if (sock.readyState === sock.OPEN) {
// 			sock.send(JSON.stringify({
// 				type: 'end',
// 				winner: winner.username,
// 				players: match.players,
// 				gameMode: match.gameMode
// 			}));
// 		}
// 	});

// 	saveMatchToDatabase({
// 		gameMode: match.gameMode,
// 		player1Id: p1.id,
// 		player2Id: p2.id,
// 		player1Score: p1.score,
// 		player2Score: p2.score,
// 		winnerId: winner.id,
// 	});

// 	if (match.gameMode === 'TNT') {
// 		handleMatchEndFromTournament(match.gameId, winner.id, p1.score, p2.score);
// 	} else {
// 		removeLobbyByGameId(gameId);
// 	}

// 	clearInterval(match.interval);
// 	matches.delete(gameId);
// 	matchSockets.delete(gameId);
// 	Logger.log(`🌟 Match ${gameId} terminado. WINNER: ${winner.username}`);
// }

// export function startCountdown(gameId: string) {
// 	const match = matches.get(gameId);
// 	const sockets = matchSockets.get(gameId);
// 	if (!match || !sockets) return;

// 	match.paused = true;
// 	let count = 3;
// 	const countdown = setInterval(() => {
// 		sockets.forEach(sock => {
// 			if (sock.readyState === sock.OPEN) {
// 				sock.send(JSON.stringify({ type: 'countdown', value: count }));
// 			}
// 		});
// 		count--;
// 		if (count === 0) {
// 			clearInterval(countdown);
// 			match.paused = false;
// 		}
// 	}, 1000);
// }
