// Reference to the canvas and its 2D context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Initial game state
const gameState = {
  ball: { x: 400, y: 200, vx: 2, vy: 2 }, // Ball position and velocity
  paddles: [
    { x: 10, y: 150, width: 10, height: 100 }, // Player 1 paddle
    { x: 780, y: 150, width: 10, height: 100 }, // Player 2 paddle
  ],
  score: { player1: 0, player2: 0 },
};

// Track key states
const keys = {
  ArrowUp: false,
  ArrowDown: false,
};

// Add event listeners for keydown and keyup
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    keys[e.key] = true; // Mark key as pressed
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    keys[e.key] = false; // Mark key as released
  }
});

// Move paddles based on key states
function movePaddles() {
  const paddle = gameState.paddles[0]; // Player 1's paddle
  const paddleSpeed = 5;

  if (keys.ArrowUp && paddle.y > 0) {
    paddle.y -= paddleSpeed; // Move paddle up
  }

  if (keys.ArrowDown && paddle.y < canvas.height - paddle.height) {
    paddle.y += paddleSpeed; // Move paddle down
  }
}

// Update game state
function updateGame() {
  const ball = gameState.ball;

  // Update ball position
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Ball collision with top/bottom walls
  if (ball.y <= 0 || ball.y >= canvas.height) {
    ball.vy *= -1; // Reverse vertical direction
  }

  // Ball collision with paddles
  gameState.paddles.forEach((paddle) => {
    if (
      ball.x >= paddle.x &&
      ball.x <= paddle.x + paddle.width &&
      ball.y >= paddle.y &&
      ball.y <= paddle.y + paddle.height
    ) {
      ball.vx *= -1; // Reverse horizontal direction
    }
  });

  // Scoring logic
  if (ball.x <= 0) {
    gameState.score.player2++;
    resetBall();
  } else if (ball.x >= canvas.width) {
    gameState.score.player1++;
    resetBall();
  }
}

// Reset the ball to the center
function resetBall() {
  const ball = gameState.ball;
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.vx *= -1; // Reverse ball direction
}

// Render the game on the canvas
function renderGame() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the ball
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(gameState.ball.x, gameState.ball.y, 10, 0, Math.PI * 2);
  ctx.fill();

  // Draw paddles
  gameState.paddles.forEach((paddle) => {
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  });

  // Draw scores
  ctx.font = '20px Arial';
  ctx.fillText(`Player 1: ${gameState.score.player1}`, 20, 20);
  ctx.fillText(`Player 2: ${gameState.score.player2}`, canvas.width - 150, 20);
}

// Game loop to update and render the game
function gameLoop() {
  movePaddles(); // Update paddle positions based on key inputs
  updateGame(); // Update ball and collision states
  renderGame(); // Render everything on the canvas
  requestAnimationFrame(gameLoop); // Loop the game
}

// Start the game loop
gameLoop();
