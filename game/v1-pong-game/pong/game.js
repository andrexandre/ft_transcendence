import {
  paddleWidth,
  paddleHeight,
  leftPaddleY,
  rightPaddleY,
  initPaddles,
  updatePaddles,
  drawPaddle,
  handleKeyPress,
  handleKeyRelease,
} from "./paddle.js";
import { ballRadius, initBall, updateBall, drawBall } from "./ball.js";
import { leftPlayerScore, rightPlayerScore, resetScores, drawScores } from "./player.js";

// Get the canvas and context
const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

// Handle scoring
function onScore(player) {
  if (player === "right") {
    rightPlayerScore += 1;
  } else if (player === "left") {
    leftPlayerScore += 1;
  }
}

// Initialize the game
function initGame() {
  initPaddles(canvas.height);
  initBall(canvas.width, canvas.height);
  resetScores();

  window.addEventListener("keydown", handleKeyPress);
  window.addEventListener("keyup", handleKeyRelease);
}

// Main game loop
function gameLoop() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw
  updatePaddles(canvas.height);
  updateBall(canvas.width, canvas.height, onScore);

  drawScores(context, canvas.width);
  drawPaddle(context, 10, leftPaddleY);
  drawPaddle(context, canvas.width - 20, rightPaddleY);
  drawBall(context);

  requestAnimationFrame(gameLoop);
}

// Start the game
initGame();
gameLoop();
