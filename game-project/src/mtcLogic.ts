// src/matchModes/mtcMode.ts
import type { MatchState } from './matchManager.js';

export function initMTCPlayers(players: any[]) {
	const positions = [5, 25, 75, 95]; // 10, 30, 70, 90
	return players.map((p, index) => ({
		id: p.userId,
		username: p.username,
		posiY: 50,
		posiX: positions[index],
		score: 0
	}));
}

export function updateMTCGame(match: MatchState) {
	match.ball.x += match.ball.dx;
	match.ball.y += match.ball.dy;

	if (match.ball.y <= 0 || match.ball.y >= 600)
		match.ball.dy *= -1;

	// Paddle collisions
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

	// Score
	if (match.ball.x < 0 || match.ball.x > 800) {
		const loserTeam = match.ball.x < 0 ? 'left' : 'right';
		addScoreToTeam(match, loserTeam);
		resetBall(match);
	}
}

function addScoreToTeam(match: MatchState, loserSide: 'left' | 'right') {
	const teamA = match.players.slice(0, 2);
	const teamB = match.players.slice(2, 4);
	const team = loserSide === 'left' ? teamB : teamA;
	team.forEach(p => p.score++);
}

function resetBall(match: MatchState) {
	match.ball = {
		x: 400,
		y: 300,
		dx: Math.random() > 0.5 ? 1 : -1,
		dy: Math.random() > 0.5 ? 1 : -1
	};
}