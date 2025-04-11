import { gameCanvas, ctx, initGameCanvas } from "./gameClient";

function GameMessageVisibility(visible: string) {
	const countdownElement = document.getElementById("game-message") as HTMLDivElement;
	if (visible === "show") {
		countdownElement.classList.remove("hidden");
	} else {
		countdownElement.classList.add("hidden");
	}
}

function drawGameMessage(gameMessage: string, color?: string) {
	const countdownElement = document.getElementById("game-message") as HTMLDivElement;
	countdownElement.classList.remove("hidden");
	countdownElement.textContent = gameMessage;
	if (color)
		countdownElement.style.color = color;
}

function updateScoreboard(username: string, playerScore: number, aiScore: number) {
    const scoreboard = document.getElementById("scoreboard") as HTMLDivElement;
    scoreboard.innerHTML = `<span style="color: blue;">${username}
    </span> ${playerScore} - ${aiScore} <span style="color: red;">BoTony</span>`;
}

export function startSingleClassic(username: string, settings: { difficulty: string, tableSize: string, sound: boolean }) {
    console.log(`🎮 Game started for: ${username}`);
    console.log("🛠 Settings:", settings);

    const menu = document.getElementById("game-main-menu") as HTMLDivElement;

    // Hide menu, show game
    menu.classList.add("hidden");
    gameCanvas.classList.remove("hidden");
    let scoreboard = document.getElementById("scoreboard") as HTMLDivElement;
    scoreboard.style.display = "block";

    const player1Id = parseInt(sessionStorage.getItem("user_id") || "0", 10); // Get user_id from session
    const player2Id = 9999; // AI Player ID 

    console.log(`🔍 Player 1 ID: ${player1Id}, Player 2 ID: ${player2Id}`);

    // Set table size based on settings
     if (settings.tableSize === "Small") {
        gameCanvas.width = 400;
        gameCanvas.height = 200;
    } else if (settings.tableSize === "Medium") {
        gameCanvas.width = 800;
        gameCanvas.height = 400;
    } else if (settings.tableSize === "Large") {
        gameCanvas.width = 1600;
        gameCanvas.height = 800;
    }

    // Game Objects
    let playerY = gameCanvas.height / 2 - 40;
    let aiY = gameCanvas.height / 2 - 40;
    let ballX = gameCanvas.width / 2;
    let ballY = gameCanvas.height / 2;
    let ballSpeedX = 0;
    let ballSpeedY = 0;
    const paddleSpeed = 5;
    const paddleHeight = 80;
    let playerScore = 0;
    let aiScore = 0;
    
    // Set Dificulty
    let aiError = 0;
    if (settings.difficulty === "Easy") {
        aiError = 50;
    } else if (settings.difficulty === "Normal") {
        aiError = 20;
    } else if (settings.difficulty === "Hard") {
        aiError = 5;
    }

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
        updateScoreboard(username, playerScore, aiScore);
        // Draw Countdown Before Game/Reset
		if (countdownValue > 0) {
			drawGameMessage(countdownValue.toString());
        }
    }

    function update() {
        if (gameOver) return;

        // Player moves
        if (upPressed && playerY > 0) playerY -= paddleSpeed;
        if (downPressed && playerY < gameCanvas.height - paddleHeight) playerY += paddleSpeed;

        // Ball moves
        ballX += ballSpeedX;
        ballY += ballSpeedY;

        if (ballY <= 10 || ballY >= gameCanvas.height - 10) ballSpeedY *= -1;
        if (ballX <= 10 && ballY > playerY && ballY < playerY + paddleHeight) ballSpeedX *= -1;
        if (ballX >= gameCanvas.width - 10 && ballY > aiY && ballY < aiY + paddleHeight) ballSpeedX *= -1;

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
        
        // AI moves + error logic
        const errorFactor = (Math.random() * aiError) - (aiError / 2);
        if (aiY + 70 < ballY + errorFactor) aiY += paddleSpeed;
        if (aiY + 70 > ballY + errorFactor) aiY -= paddleSpeed;

        // AI reaction delay based on wait
        // const reactionThreshold = 20 + aiError; 
        // if (Math.abs(ballX - gameCanvas.width + 100) < reactionThreshold) {
            // const errorFactor = (Math.random() * aiError) - (aiError / 2);
        
            // if (aiY + paddleHeight / 2 < ballY + errorFactor) aiY += paddleSpeed;
            // if (aiY + paddleHeight / 2 > ballY + errorFactor) aiY -= paddleSpeed;
        // }


        if (aiY < 0) aiY = 0;
        if (aiY > gameCanvas.height - 80) aiY = gameCanvas.height - 80;
    }

    function checkWinCondition() { /// Change condition score and Winning msg ///
        if (playerScore === 2) {
            gameOver = true;
            setTimeout(() => endGame(`${username} Wins!`, "blue"), 1000);
        } else if (aiScore === 2) {
            gameOver = true;
            setTimeout(() => endGame("YOU Suck!", "red"), 1000);
        }
    }
    
    async function saveMatchToDatabase(player1Id: number, player2Id: number, player1Score: number, player2Score: number, gameMode: string, winnerId: number) {
        try {
            const response = await fetch("http://127.0.0.1:7000/save-matchHistory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ player1Id, player2Id, player1Score, player2Score, gameMode, winnerId }),
            });
    
            if (!response.ok) throw new Error("Failed to save match");
    
            console.log("✅ Match saved successfully!");
    
        } catch (error) {
            console.error("❌ Error saving match:", error);
        }
    }

    function endGame(message: string, color: string) {
        countdownValue = 0; 
        gameOver = true;
    
        if (!ctx) return;
    
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    
        // Draw Winning Message
		drawGameMessage(message, color);
       
        // Determine winner
        const winnerId = playerScore > aiScore ? player1Id : player2Id;
        
        // Send match data to DB
        saveMatchToDatabase(player1Id, player2Id, playerScore, aiScore, "classic", winnerId);

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

        if (aiError > 5) aiError -= 5; 
    
        const countdownInterval = setInterval(() => {
            countdownValue--;
    
            if (countdownValue <= 0) {
                clearInterval(countdownInterval);
                if (!gameOver) {
                    const angleOptions = [Math.random() * 90 - 45, Math.random() * 90 + 135];
                    const randomAngle = angleOptions[Math.floor(Math.random() * angleOptions.length)];
                    
                    const angleRad = randomAngle * (Math.PI / 180);

                    const speed = 7;
                    ballSpeedX = speed * Math.cos(angleRad);
                    ballSpeedY = speed * Math.sin(angleRad);
                    GameMessageVisibility("hide");
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
		GameMessageVisibility("hide");
		gameCanvas.classList.add("hidden");
        menu.classList.remove("hidden");
        scoreboard.style.display = "none";
		document.getElementById('sidebar')?.classList.toggle('hidden');
	}
    
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

    resetGame();
    gameLoop();
}
