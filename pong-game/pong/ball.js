// Import paddle dimensions for collision detection
import { paddleWidth, paddleHeight, leftPaddleY, rightPaddleY } from "./paddle.js";

// Ball properties
export const ballRadius = 10;
export let ballX = 0; 
export let ballY = 0; 
export let ballSpeedX = 4;
export let ballSpeedY = 4;

// Initialize ball position
export function initBall(canvasWidth, canvasHeight) {
  ballX = canvasWidth / 2;
  ballY = canvasHeight / 2;
}


// Reset ball position to the center and reverse direction
export function resetBall(canvasWidth, canvasHeight) {
  ballX = canvasWidth / 2;
  ballY = canvasHeight / 2;
  ballSpeedX = -ballSpeedX;
  ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);
}


// Update ball position and handle collisions
export function updateBall(canvasWidth, canvasHeight, onScore) {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Collisions with walls
  if (ballY - ballRadius <= 0 || ballY + ballRadius >= canvasHeight) {
    ballSpeedY *= -1;
  }

  // Collisions with paddles
  if (
    ballX - ballRadius <= paddleWidth &&
    ballY >= leftPaddleY &&
    ballY <= leftPaddleY + paddleHeight
  ) {
    ballSpeedX *= -1;
    ballX = paddleWidth + ballRadius;
  }
  if (
    ballX + ballRadius >= canvasWidth - paddleWidth &&
    ballY >= rightPaddleY &&
    ballY <= rightPaddleY + paddleHeight
  ) {
    ballSpeedX *= -1;
    ballX = canvasWidth - paddleWidth - ballRadius;
  }

  // Ball out of bounds
  // if (ballX - ballRadius <= 0) {
  //   onScore("right");
  //   resetBall(canvasWidth, canvasHeight); // Reset after scoring
  // } else if (ballX + ballRadius >= canvasWidth) {
  //   onScore("left");
  //   resetBall(canvasWidth, canvasHeight);
  // }
  if (ballX - ballRadius <= 0) {
    if (!scoredRecently) {
      onScore("right");
      resetBall(canvasWidth, canvasHeight);
      scoredRecently = true; // Prevent multiple calls
      setTimeout(() => (scoredRecently = false), 500); // Delay further scoring
    }
    else {
      onScore("left");
      resetBall(canvasWidth, canvasHeight);
      scoredRecently = true; // Prevent multiple calls
      setTimeout(() => (scoredRecently = false), 500); // Delay further scoring
    }
  }
  
}

// Draw the ball
export function drawBall(context) {
  context.fillStyle = "white";
  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  context.fill();
}
