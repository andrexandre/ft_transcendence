const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

// Game objects
const playerPaddle = { x: 20, y: 150, width: 10, height: 80, speed: 5 };
const botPaddle = { x: 770, y: 150, width: 10, height: 80, speed: 3 };
const ball = { x: 400, y: 200, radius: 8, speedX: 4, speedY: 4 };

// Move paddles
function movePaddles() {
    if (keys.ArrowUp && playerPaddle.y > 0) {
        playerPaddle.y -= playerPaddle.speed;
    }
    if (keys.ArrowDown && playerPaddle.y < canvas.height - playerPaddle.height) {
        playerPaddle.y += playerPaddle.speed;
    }

    // Bot AI: Move towards the ball
    if (botPaddle.y + botPaddle.height / 2 < ball.y) {
        botPaddle.y += botPaddle.speed;
    } else {
        botPaddle.y -= botPaddle.speed;
    }
}

// Move ball
function moveBall() {
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Ball bounces off top and bottom walls
    if (ball.y <= 0 || ball.y >= canvas.height) {
        ball.speedY *= -1;
    }

    // Ball bounces off paddles
    if (
        (ball.x <= playerPaddle.x + playerPaddle.width && ball.y >= playerPaddle.y && ball.y <= playerPaddle.y + playerPaddle.height) ||
        (ball.x >= botPaddle.x - botPaddle.width && ball.y >= botPaddle.y && ball.y <= botPaddle.y + botPaddle.height)
    ) {
        ball.speedX *= -1;
    }

    // Reset ball if it goes out
    if (ball.x <= 0 || ball.x >= canvas.width) {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.speedX = (Math.random() > 0.5 ? 1 : -1) * 4;
        ball.speedY = (Math.random() > 0.5 ? 1 : -1) * 4;
    }
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paddles
    ctx.fillStyle = "white";
    ctx.fillRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
    ctx.fillRect(botPaddle.x, botPaddle.y, botPaddle.width, botPaddle.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

// Game loop
function gameLoop() {
    movePaddles();
    moveBall();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
