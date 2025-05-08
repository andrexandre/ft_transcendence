// src/bot.ts
import { MatchState } from "./matchManager.js";

const configByDifficulty = {
	Easy: { interval: 1000 },
	Medium: { interval: 500 },
	Hard: { interval: 250 }
} as const;

const botMemory = new Map<string, { targetY: number; lastUpdate?: number }>();

export function updateBotPlayer(match: MatchState) {
	const gameId = match.gameId;
	const bot = match.players[1];
	const ball = match.ball;

	if (bot.posiX !== 100) return;

	type Difficulty = keyof typeof configByDifficulty;
	const difficulty = (match.aiDifficulty || "medium") as Difficulty;

	const config = configByDifficulty[difficulty];

	if (!botMemory.has(gameId)) {
		botMemory.set(gameId, { targetY: 50 });
	}
	const memory = botMemory.get(gameId)!;

	if (!memory.lastUpdate || Date.now() - memory.lastUpdate > config.interval) {
		memory.targetY = predictBallIntersectionY(ball, 100);
		memory.lastUpdate = Date.now();
	}

	const paddleCenterY = (bot.posiY / 100) * 600 + 40;
	if (paddleCenterY < memory.targetY - 10) {
		simulateBotKey(bot, "down");
	} else if (paddleCenterY > memory.targetY + 10) {
		simulateBotKey(bot, "up");
	}
}

function simulateBotKey(bot: MatchState["players"][number], direction: "up" | "down") {
	if (direction === "up") {
		bot.posiY = Math.max(0, bot.posiY - 2);
	} else {
		bot.posiY = Math.min(100, bot.posiY + 2);
	}
}

function predictBallIntersectionY(
	ball: MatchState["ball"], paddleX: number): number {
	let { x, y, dx, dy } = { ...ball };

	while ((dx > 0 && x < 790) || (dx < 0 && x > 10)) {
		x += dx;
		y += dy;
		if (y <= 0 || y >= 590) dy *= -1;

		if ((dx > 0 && x >= 790) || (dx < 0 && x <= 10)) {
			break;
		}
	}
	return y;
}
