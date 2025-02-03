export const paddleWidth = 10;
export const paddleHeight = 100;
export const paddleSpeed = 5;

export let leftPaddleY = 0;
export let rightPaddleY = 0;

let leftPaddleDY = 0;
let rightPaddleDY = 0;


// Initialize paddles
export function initPaddles(canvasHeight) {
  leftPaddleY = canvasHeight / 2 - paddleHeight / 2;
  rightPaddleY = canvasHeight / 2 - paddleHeight / 2;
}

// Update paddle positions
export function updatePaddles(canvasHeight) {
  leftPaddleY = Math.max(
    0,
    Math.min(canvasHeight - paddleHeight, leftPaddleY + leftPaddleDY)
  );
  rightPaddleY = Math.max(
    0,
    Math.min(canvasHeight - paddleHeight, rightPaddleY + rightPaddleDY)
  );
}

// Draw a paddle
export function drawPaddle(context, x, y) {
  context.fillStyle = "white";
  context.fillRect(x, y, paddleWidth, paddleHeight);
}

// Handle key press
export function handleKeyPress(event) {
  switch (event.key) {
    case "w":
      leftPaddleDY = -paddleSpeed;
      break;
    case "s":
      leftPaddleDY = paddleSpeed;
      break;
    case "ArrowUp":
      rightPaddleDY = -paddleSpeed;
      break;
    case "ArrowDown":
      rightPaddleDY = paddleSpeed;
      break;
  }
}

// Handle key release
export function handleKeyRelease(event) {
  switch (event.key) {
    case "w":
    case "s":
      leftPaddleDY = 0;
      break;
    case "ArrowUp":
    case "ArrowDown":
      rightPaddleDY = 0;
      break;
  }
}
