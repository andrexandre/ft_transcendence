"use strict";
const singleButton = document.getElementById("single");
const menu = document.getElementById("menu");
const gameCanvas = document.getElementById("gameCanvas");
if (!singleButton || !menu || !gameCanvas) {
    console.error("One or more elements not found");
}
else {
    singleButton.addEventListener("click", () => {
        console.log("Single Player Clicked!");
        menu.classList.add("hidden");
        gameCanvas.classList.remove("hidden");
        gameCanvas.classList.add("visible"); // ✅ Ensure visibility
        startSinglePlayerGame();
    });
}
function startSinglePlayerGame() {
    if (!gameCanvas)
        return;
    gameCanvas.width = 800;
    gameCanvas.height = 400;
    const ctx = gameCanvas.getContext("2d");
    if (!ctx) {
        console.error("Canvas context not found!");
        return;
    }
    let playerY = gameCanvas.height / 2 - 40;
    let aiY = gameCanvas.height / 2 - 40;
    let ballX = gameCanvas.width / 2;
    let ballY = gameCanvas.height / 2;
    let ballSpeedX = 5;
    let ballSpeedY = 3;
    function draw() {
        ctx.fillStyle = "black"; // Ensure background is black
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        ctx.fillStyle = "white"; // Ensure paddles & ball are visible
        ctx.fillRect(10, playerY, 10, 80);
        ctx.fillRect(gameCanvas.width - 20, aiY, 10, 80);
        ctx.beginPath();
        ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
        ctx.fill();
    }
    function update() {
        ballX += ballSpeedX;
        ballY += ballSpeedY;
        if (ballY <= 0 || ballY >= gameCanvas.height)
            ballSpeedY *= -1;
        if (ballX <= 20 && ballY > playerY && ballY < playerY + 80)
            ballSpeedX *= -1;
        if (ballX >= gameCanvas.width - 20 && ballY > aiY && ballY < aiY + 80)
            ballSpeedX *= -1;
        if (ballX < 0 || ballX > gameCanvas.width)
            resetGame();
        aiY = ballY - 40;
    }
    function resetGame() {
        ballX = gameCanvas.width / 2;
        ballY = gameCanvas.height / 2;
        ballSpeedX = 5;
        ballSpeedY = 3;
    }
    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
    gameLoop();
}
