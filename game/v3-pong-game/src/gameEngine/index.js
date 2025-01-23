// Game state
const gameState = {
  ball: { x: 50, y: 50, vx: 1.2, vy: 1.2 },
  paddles: [
    { player: 1, y: 40 },
    { player: 2, y: 40 },
  ],
  score: { player1: 0, player2: 0 },
  status: 'playing', // Game status: 'waiting', 'playing', 'ended'
};
  
// Update game state function
function updateGameState() {
  if (gameState.status !== 'playing') return;

  // Update ball position
  gameState.ball.x += gameState.ball.vx;
  gameState.ball.y += gameState.ball.vy;

  // Ball collision with top and bottom walls
  if (gameState.ball.y <= 0 || gameState.ball.y >= 100) {
    gameState.ball.vy *= -1; // Reverse vertical direction
  }

  // Ball collision with paddles
  const ball = gameState.ball;
  const paddle1 = gameState.paddles[0];
  const paddle2 = gameState.paddles[1];

  // Check collision with Player 1's paddle
  if (
    ball.x <= 10 && // Near left paddle
    ball.y >= paddle1.y &&
    ball.y <= paddle1.y + 20
  ) {
    ball.vx *= -1; // Reverse horizontal direction
  }

  // Check collision with Player 2's paddle
  if (
    ball.x >= 90 && // Near right paddle
    ball.y >= paddle2.y &&
    ball.y <= paddle2.y + 20
  ) {
    ball.vx *= -1; // Reverse horizontal direction
  }

  // Scoring
  if (ball.x <= 0) {
    gameState.score.player2++;
    resetGameState(); // Reset after scoring
  } else if (ball.x >= 100) {
    gameState.score.player1++;
    resetGameState(); // Reset after scoring
  }
}

function resetGameState() {
  // Reset ball position
  gameState.ball.x = 50;
  gameState.ball.y = 50;

  const isMovingRight = Math.random() > 0.5;
  const minAngle = Math.PI / 4; // 45°
  const maxAngle = (3 * Math.PI) / 4; // 135°
  const randomAngle = Math.random() * (maxAngle - minAngle) + minAngle;

  // Determine velocity based on direction
  const speed = 1.1; // Adjust speed as needed
  gameState.ball.vx = isMovingRight ? Math.cos(randomAngle) * speed : -Math.cos(randomAngle) * speed;
  gameState.ball.vy = Math.sin(randomAngle) * speed;

  // Do not reset paddle positions
  gameState.status = 'playing';
}


function updateBotPaddle() {
  const botPaddle = gameState.paddles[1]; // Player 2's paddle
  const ballY = gameState.ball.y;

  // Bot follows the ball with some delay
  if (ballY > botPaddle.y + 10) {
    botPaddle.y += 1; // Move paddle down (adjust speed as needed)
  } else if (ballY < botPaddle.y + 10) {
    botPaddle.y -= 1; // Move paddle up (adjust speed as needed)
  }

  // Constrain the bot's paddle within the game area
  if (botPaddle.y < 0) botPaddle.y = 0;
  if (botPaddle.y > 80) botPaddle.y = 80;
}

// Export functions and game state
module.exports = { gameState, updateGameState, resetGameState, updateBotPaddle };
  