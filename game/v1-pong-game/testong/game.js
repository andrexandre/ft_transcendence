// // Get the canvas and context
// const canvas = document.getElementById("gameCanvas");
// const context = canvas.getContext("2d");

// // Set canvas dimensions
// canvas.width = 800;
// canvas.height = 600;

// // Paddle properties
// const paddleWidth = 10;
// const paddleHeight = 100;
// const paddleSpeed = 5;

// let leftPaddleY = canvas.height / 2 - paddleHeight / 2; // Left paddle position
// let rightPaddleY = canvas.height / 2 - paddleHeight / 2; // Right paddle position

// let leftPaddleDY = 0; // Left paddle vertical speed
// let rightPaddleDY = 0; // Right paddle vertical speed

// // Ball properties
// const ballRadius = 10;
// let ballX = canvas.width / 2; // Ball's X position
// let ballY = canvas.height / 2; // Ball's Y position
// let ballSpeedX = 4; // Ball's horizontal speed
// let ballSpeedY = 4; // Ball's vertical speed

// // Handle key press
// window.addEventListener("keydown", (event) => {
//   switch (event.key) {
//     case "w":
//       leftPaddleDY = -paddleSpeed;
//       break;
//     case "s":
//       leftPaddleDY = paddleSpeed;
//       break;
//     case "ArrowUp":
//       rightPaddleDY = -paddleSpeed;
//       break;
//     case "ArrowDown":
//       rightPaddleDY = paddleSpeed;
//       break;
//   }
// });

// // Handle key release
// window.addEventListener("keyup", (event) => {
//   switch (event.key) {
//     case "w":
//     case "s":
//       leftPaddleDY = 0;
//       break;
//     case "ArrowUp":
//     case "ArrowDown":
//       rightPaddleDY = 0;
//       break;
//   }
// });

// // Draw the net
// function drawNet() {
//   context.fillStyle = "white";
//   context.fillRect(canvas.width / 2 - 1, 0, 2, canvas.height);
// }

// // Draw a paddle
// function drawPaddle(x, y) {
//   context.fillStyle = "white";
//   context.fillRect(x, y, paddleWidth, paddleHeight);
// }

// // Draw the ball
// function drawBall(x, y) {
//   context.fillStyle = "white";
//   context.beginPath();
//   context.arc(x, y, ballRadius, 0, Math.PI * 2);
//   context.fill();
// }

// // Update paddle positions
// function updatePaddles() {
//   leftPaddleY += leftPaddleDY;
//   leftPaddleY = Math.max(0, Math.min(canvas.height - paddleHeight, leftPaddleY));

//   rightPaddleY += rightPaddleDY;
//   rightPaddleY = Math.max(0, Math.min(canvas.height - paddleHeight, rightPaddleY));
// }

// // Update ball position and handle collisions
// function updateBall() {
//   ballX += ballSpeedX;
//   ballY += ballSpeedY;

//   if (ballY - ballRadius <= 0 || ballY + ballRadius >= canvas.height) {
//     ballSpeedY *= -1;
//   }

//   if (
//     ballX - ballRadius <= 20 &&
//     ballY >= leftPaddleY &&
//     ballY <= leftPaddleY + paddleHeight
//   ) {
//     ballSpeedX *= -1;
//     ballX = 20 + ballRadius;
//   }

//   if (
//     ballX + ballRadius >= canvas.width - 20 &&
//     ballY >= rightPaddleY &&
//     ballY <= rightPaddleY + paddleHeight
//   ) {
//     ballSpeedX *= -1;
//     ballX = canvas.width - 20 - ballRadius;
//   }

//   if (ballX - ballRadius < 0 || ballX + ballRadius > canvas.width) {
//     resetBall();
//   }
// }

// // Reset the ball to the center
// function resetBall() {
//   ballX = canvas.width / 2;
//   ballY = canvas.height / 2;
//   ballSpeedX *= -1;
// }

// // Game loop
// function gameLoop() {
//   context.clearRect(0, 0, canvas.width, canvas.height);

//   drawNet();

//   updatePaddles();
//   drawPaddle(10, leftPaddleY);
//   drawPaddle(canvas.width - 20, rightPaddleY);

//   updateBall();
//   drawBall(ballX, ballY);

//   requestAnimationFrame(gameLoop);
// }

// // Start the game
// gameLoop();
