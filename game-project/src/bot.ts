import { MatchState } from "./matchManager.js";


export function updateBotPlayer(match: MatchState) {
    const bot = match.players[1];
    const ball = match.ball;
    
    if ((ball.dx > 0 && bot.posiX === 0) || (ball.dx < 0 && bot.posiX === 100)) {
      return; 
    }
  
    const paddleCenter = (bot.posiY / 100) * 600 + 40;
    
    if (paddleCenter < ball.y) {
      bot.posiY += 1.5; 
    } else if (paddleCenter > ball.y) {
      bot.posiY -= 1.5; 
    }
  
    bot.posiY = Math.max(0, Math.min(100, bot.posiY));
  }
  