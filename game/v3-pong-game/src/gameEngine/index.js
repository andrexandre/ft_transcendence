// Game state
const gameState = {
    ball: { x: 50, y: 50, vx: 2, vy: 2 },
    paddles: [
      { player: 1, y: 40 }, // Paddle 1 position
      { player: 2, y: 40 }, // Paddle 2 position
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
    if (
      (gameState.ball.x <= 10 && gameState.ball.y >= gameState.paddles[0].y && gameState.ball.y <= gameState.paddles[0].y + 20) ||
      (gameState.ball.x >= 90 && gameState.ball.y >= gameState.paddles[1].y && gameState.ball.y <= gameState.paddles[1].y + 20)
    ) {
      gameState.ball.vx *= -1; // Reverse horizontal direction
    }
  
    // Scoring
    if (gameState.ball.x <= 0) {
      gameState.score.player2++;
      resetGameState(); // Reset after scoring
    } else if (gameState.ball.x >= 100) {
      gameState.score.player1++;
      resetGameState(); // Reset after scoring
    }
  }
  
  // Reset game state function
  function resetGameState() {
    gameState.ball = { x: 50, y: 50, vx: 2, vy: 2 };
    gameState.paddles = [
      { player: 1, y: 40 },
      { player: 2, y: 40 },
    ];
    gameState.status = 'playing';
  }
  
  // Export functions and game state
  module.exports = { gameState, updateGameState, resetGameState };
  