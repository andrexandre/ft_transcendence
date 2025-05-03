import { MatchState } from "./matchManager.js";

const BOT_UPDATE_INTERVAL = 1000;
const botMemory = new Map<string, { targetY: number; lastUpdate?: number }>();

export function updateBotPlayer(match: MatchState) {
	const gameId = match.gameId;
	const bot = match.players[1];
	const ball = match.ball;

	if (bot.posiX !== 100) return;

	if (!botMemory.has(gameId)) {
		botMemory.set(gameId, { targetY: 50 });
	}

	const memory = botMemory.get(gameId)!;

	if (!memory.lastUpdate || Date.now() - memory.lastUpdate > BOT_UPDATE_INTERVAL) {
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
		bot.posiY = Math.max(0, bot.posiY - 1.5);
	} else {
		bot.posiY = Math.min(100, bot.posiY + 1.5);
	}
}

function predictBallIntersectionY(
	ball: MatchState["ball"],
	paddleX: number
	): number {
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


// export function updateBotPlayer(match: MatchState) {
//     const bot = match.players[1];
//     const ball = match.ball;
    
//     if ((ball.dx > 0 && bot.posiX === 0) || (ball.dx < 0 && bot.posiX === 100)) {
//       return; 
//     }
  
//     const paddleCenter = (bot.posiY / 100) * 600 + 40;
    
//     if (paddleCenter < ball.y) {
//       bot.posiY += 1.5; 
//     } else if (paddleCenter > ball.y) {
//       bot.posiY -= 1.5; 
//     }
  
//     bot.posiY = Math.max(0, Math.min(100, bot.posiY));
//   }
  