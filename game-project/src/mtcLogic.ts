// src/matchModes/mtcLogic.ts
import type { MatchState } from './matchManager.js';

export function initMTCPlayers(players: any[]) {
	const positions = [2, 25, 75, 98]; // 10, 30, 70, 90
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
}
