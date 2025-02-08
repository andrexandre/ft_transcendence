export function startSingleClassic()
{
    const gameCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    const ctx = gameCanvas.getContext("2d");
    const menu = document.getElementById("menu") as HTMLDivElement;
    const singleButton = document.getElementById("single") as HTMLButtonElement;

    // Hiden menu
    menu.classList.add("hidden");
    menu.classList.remove("visible");

    // Clear UI
    document.querySelectorAll(".scoreboard, .countdown, .win-message").forEach(el => el.remove());

    // Create new elements
    const scoreboard = document.createElement("div");
    scoreboard.classList.add("scoreboard");
    document.body.appendChild(scoreboard);

    const countdownDisplay = document.createElement("div");
    countdownDisplay.classList.add("countdown");
    document.body.appendChild(countdownDisplay);

    const winMessage = document.createElement("div");
    winMessage.classList.add("countdown", "win-message");
    document.body.appendChild(winMessage);

    gameCanvas.width = 800;
    gameCanvas.height = 400;
    gameCanvas.style.visibility = "visible";

    let playerY = gameCanvas.height / 2 - 40;
    let aiY = gameCanvas.height / 2 - 40;
    let ballX = gameCanvas.width / 2;
    let ballY = gameCanvas.height / 2;
    let ballSpeedX = 0;
    let ballSpeedY = 0;
    const initialSpeedX = 2;
    const initialSpeedY = 1.5;
    const paddleSpeed = 2.5;
    const paddleHeight = 80;

    let playerScore = 0;
    let aiScore = 0;
    let aiError = 40; // AI Dum
    let gameOver = false;

    let upPressed = false;
    let downPressed = false;

    function draw() {
        if (!ctx || gameOver) return;
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

        ctx.fillStyle = "blue";
        ctx.fillRect(0, playerY, 10, paddleHeight);

        ctx.fillStyle = "red";
        ctx.fillRect(gameCanvas.width - 10, aiY, 10, paddleHeight);

        ctx.fillStyle = "green"; 
        ctx.beginPath();
        ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
        ctx.fill();

        scoreboard.innerHTML = `<span style="color: blue;">Player 1</span> ${playerScore} - ${aiScore} <span style="color: red;">BoTony</span>`;
    }

    function update() {
        if (gameOver) return;

        if (upPressed && playerY > 0) playerY -= paddleSpeed;
        if (downPressed && playerY < gameCanvas.height - paddleHeight) playerY += paddleSpeed;

        ballX += ballSpeedX;
        ballY += ballSpeedY;

        // collisions
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

        // AI brain
        // aiY = ballY - paddleHeight / 2;
        const errorFactor = Math.random() * aiError - aiError / 2;
        if (aiY + 70 < ballY + errorFactor) aiY += paddleSpeed;
        if (aiY + 70 > ballY + errorFactor) aiY -= paddleSpeed;

        if (aiY < 0) aiY = 0;
        if (aiY > gameCanvas.height - 80) aiY = gameCanvas.height - 80;
    }

    function checkWinCondition() {
        if (playerScore === 5) {
            endGame("Player 1 Wins!", "blue");
        } else if (aiScore === 5) {
            endGame("BoTony Wins!", "red");
        }
    }

    function endGame(message: string, color: string) {
        gameOver = true;
        winMessage.innerHTML = message;
        winMessage.style.display = "block";
        winMessage.style.color = color;

        setTimeout(() => {
            winMessage.style.display = "none";
            scoreboard.style.display = "none";
            returnToMenu();
        }, 5000);
    }

    function resetGame() {
        if (gameOver) return;
        ballX = gameCanvas.width / 2;
        ballY = gameCanvas.height / 2;
        ballSpeedX = 0;
        ballSpeedY = 0;

        showCountdown(() => {
            ballSpeedX = initialSpeedX;
            ballSpeedY = initialSpeedY;
        });

        if (aiError > 5) aiError -= 5; // Reduce AI error
    }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    function keyDownHandler(event: KeyboardEvent) {
        if (event.key === "ArrowUp") upPressed = true;
        if (event.key === "ArrowDown") downPressed = true;
    }

    function keyUpHandler(event: KeyboardEvent) {
        if (event.key === "ArrowUp") upPressed = false;
        if (event.key === "ArrowDown") downPressed = false;
    }

    function showCountdown(callback: () => void) {
        let count = 3;
        countdownDisplay.style.display = "block";
        countdownDisplay.style.color = "green";

        function updateCountdown() {
            countdownDisplay.innerHTML = count.toString();
            if (count > 0) {
                count--;
                setTimeout(updateCountdown, 1000);
            } else {
                countdownDisplay.style.display = "none";
                callback();
            }
        }

        updateCountdown();
    }

    function returnToMenu() {
        gameCanvas.style.visibility = "hidden";
        menu.classList.remove("hidden");
        menu.classList.add("visible");

        // Remove previous event listeners to prevent stacking
        singleButton.replaceWith(singleButton.cloneNode(true));
        document.getElementById("single")?.addEventListener("click", startSingleClassic);
    }

    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

    showCountdown(() => {
        ballSpeedX = initialSpeedX;
        ballSpeedY = initialSpeedY;
    });

    gameLoop();
}
