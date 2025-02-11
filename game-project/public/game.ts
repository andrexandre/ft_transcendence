export function startSingleClassic() {
    const gameCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    const ctx = gameCanvas.getContext("2d");
    const menu = document.getElementById("menu") as HTMLDivElement;

    // Hide menu, show game
    menu.classList.add("hidden");
    menu.classList.remove("visible");
    gameCanvas.style.visibility = "visible";

    // Create elements scoreboard/wining/countdown
    let scoreboard = document.getElementById("scoreboard") as HTMLDivElement;
    if (!scoreboard) {
        scoreboard = document.createElement("div");
        scoreboard.id = "scoreboard";
        scoreboard.classList.add("scoreboard");
        document.body.appendChild(scoreboard);
    }
    scoreboard.style.display = "block";

    let countdownDisplay = document.getElementById("countdown") as HTMLDivElement;
    if (!countdownDisplay) {
        countdownDisplay = document.createElement("div");
        countdownDisplay.id = "countdown";
        countdownDisplay.classList.add("countdown");
        document.body.appendChild(countdownDisplay);
    }
    countdownDisplay.style.display = "none";

    let winMessage = document.getElementById("win-message") as HTMLDivElement;
    if (!winMessage) {
        winMessage = document.createElement("div");
        winMessage.id = "win-message";
        winMessage.classList.add("countdown", "win-message");
        document.body.appendChild(winMessage);
    }
    winMessage.style.display = "none";

    // Game Variables
    gameCanvas.width = 800;
    gameCanvas.height = 400;

    let playerY = gameCanvas.height / 2 - 40;
    let aiY = gameCanvas.height / 2 - 40;
    let ballX = gameCanvas.width / 2;
    let ballY = gameCanvas.height / 2;
    let ballSpeedX = 0;
    let ballSpeedY = 0;
    const initialSpeedX = 8;
    const initialSpeedY = 4;
    const paddleSpeed = 2.5;
    const paddleHeight = 80;

    let playerScore = 0;
    let aiScore = 0;
    let aiError = 40;
    let gameOver = false;
    let countdownValue = 0;

    let upPressed = false;
    let downPressed = false;

    function draw() {
        if (!ctx) return;
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    
        // Draw paddles
        ctx.fillStyle = "blue";
        ctx.fillRect(0, playerY, 10, paddleHeight);
        ctx.fillStyle = "red";
        ctx.fillRect(gameCanvas.width - 10, aiY, 10, paddleHeight);
    
        // Draw ball
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
        ctx.fill();
    
        // Draw scoreboard
        scoreboard.innerHTML = `<span style="color: blue;">Couves</span> ${playerScore} - ${aiScore} <span style="color: red;">BoTony</span>`;
    
        // 🎯 ✅ Draw Countdown Before Game/Reset
        if (countdownValue > 0) {
            ctx.fillStyle = "green";
            ctx.font = "100px 'Press Start 2P'";
            ctx.textAlign = "center";
            ctx.fillText(countdownValue.toString(), gameCanvas.width / 2, gameCanvas.height / 2);
        }
    }

    function update() {
        if (gameOver) return;

        if (upPressed && playerY > 0) playerY -= paddleSpeed;
        if (downPressed && playerY < gameCanvas.height - paddleHeight) playerY += paddleSpeed;

        ballX += ballSpeedX;
        ballY += ballSpeedY;

        if (ballY <= 0 || ballY >= gameCanvas.height) ballSpeedY *= -1;
        if (ballX <= 20 && ballY > playerY && ballY < playerY + paddleHeight) ballSpeedX *= -1;
        if (ballX >= gameCanvas.width - 20 && ballY > aiY && ballY < aiY + paddleHeight) ballSpeedX *= -1;

        if (ballX < 0) {
            aiScore++;
            checkWinCondition();
            resetGame();
        }
        if (ballX > gameCanvas.width) {
            playerScore++;
            checkWinCondition();
            resetGame();
        }

        const errorFactor = Math.random() * aiError - aiError / 2;
        if (aiY + 70 < ballY + errorFactor) aiY += paddleSpeed;
        if (aiY + 70 > ballY + errorFactor) aiY -= paddleSpeed;

        if (aiY < 0) aiY = 0;
        if (aiY > gameCanvas.height - 80) aiY = gameCanvas.height - 80;
    }

    function checkWinCondition() {
        if (playerScore === 5) {
            gameOver = true;  // ✅ Stop game loop
            setTimeout(() => endGame("Player 1 Wins!", "blue"), 1000);
        } else if (aiScore === 5) {
            gameOver = true;  // ✅ Stop game loop
            setTimeout(() => endGame("BoTony Wins!", "red"), 1000);
        }
    }
    
    function endGame(message: string, color: string) {
        countdownValue = 0; // Stop countdown
        gameOver = true;
    
        if (!ctx) return;
    
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
        // Draw Winning Message
        ctx.fillStyle = color;
        ctx.font = "50px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.fillText(message, gameCanvas.width / 2, gameCanvas.height / 2);
    
        setTimeout(() => {
            returnToMenu();
        }, 5000);
    }

    function resetGame() {
        if (gameOver) return;
    
        ballX = gameCanvas.width / 2;
        ballY = gameCanvas.height / 2;
        ballSpeedX = 0;
        ballSpeedY = 0;
    
        countdownValue = 3;
    
        const countdownInterval = setInterval(() => {
            countdownValue--;
    
            if (countdownValue <= 0) {
                clearInterval(countdownInterval);
                if (!gameOver) {
                    ballSpeedX = initialSpeedX;
                    ballSpeedY = initialSpeedY;
                }
            }
        }, 1000);
    }
    
    function gameLoop() {
        if (!gameOver) {
            update();
            draw();
            requestAnimationFrame(gameLoop);
        }
    }
    

    function keyDownHandler(event: KeyboardEvent) {
        if (event.key === "ArrowUp") upPressed = true;
        if (event.key === "ArrowDown") downPressed = true;
    }

    function keyUpHandler(event: KeyboardEvent) {
        if (event.key === "ArrowUp") upPressed = false;
        if (event.key === "ArrowDown") downPressed = false;
    }
    
    function returnToMenu() {
        gameCanvas.style.visibility = "hidden";
        menu.classList.remove("hidden");
        menu.classList.add("visible");
        scoreboard.style.display = "none";
    }
    
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

    resetGame();
    gameLoop();
}
