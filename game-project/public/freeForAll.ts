export function startFreeForAll(player1: string, player2: string) {
    console.log(`🎮 Free For All started! ${player1} vs ${player2}`);

    const gameCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    const ctx = gameCanvas.getContext("2d");
    const menu = document.getElementById("menu") as HTMLDivElement;

    // Hide menu, show game
    menu.classList.add("hidden");
    menu.classList.remove("visible");
    gameCanvas.style.visibility = "visible";

    // Set game canvas size
    gameCanvas.width = 800;
    gameCanvas.height = 400;

    // Create elements scoreboard
    let scoreboard = document.getElementById("scoreboard") as HTMLDivElement;
    if (!scoreboard) {
        scoreboard = document.createElement("div");
        scoreboard.id = "scoreboard";
        scoreboard.classList.add("scoreboard");
        document.body.appendChild(scoreboard);
    }
    scoreboard.style.display = "block";

    // Initial game state
    let ballX = gameCanvas.width / 2;
    let ballY = gameCanvas.height / 2;
    let ballSpeedX = Math.random() > 0.5 ? 5 : -5; // Random start direction
    let ballSpeedY = Math.random() > 0.5 ? 3 : -3;
    
    const paddleWidth = 10;
    const paddleHeight = 80;
    let player1Y = gameCanvas.height / 2 - paddleHeight / 2;
    let player2Y = gameCanvas.height / 2 - paddleHeight / 2;
    
    let player1Score = 0;
    let player2Score = 0;
    
    let upPressed = false;
    let downPressed = false;
    let wPressed = false;
    let sPressed = false;

    // WebSocket Connection for Real-Time Movement
    const socket = new WebSocket("ws://localhost:5000/ws");

    socket.onopen = () => {
        console.log("📡 WebSocket connected for Free For All.");
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "player-move") {
            if (data.username === player1) {
                player1Y = data.y;
            } else if (data.username === player2) {
                player2Y = data.y;
            }
        }
    };

    socket.onclose = () => {
        console.warn("🔴 WebSocket connection closed.");
    };

    function draw() {
        if (!ctx) return;
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        
        // Draw paddles
        ctx.fillStyle = "blue";
        ctx.fillRect(0, player1Y, paddleWidth, paddleHeight);
        
        ctx.fillStyle = "red";
        ctx.fillRect(gameCanvas.width - paddleWidth, player2Y, paddleWidth, paddleHeight);
        
        // Draw ball
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw scoreboard
        scoreboard.innerHTML = `<span style="color: blue;">${player1}</span> ${player1Score} - ${player2Score} <span style="color: red;">${player2}</span>`;
    }

    function update() {
        ballX += ballSpeedX;
        ballY += ballSpeedY;

        // Ball collision with top/bottom walls
        if (ballY <= 0 || ballY >= gameCanvas.height) ballSpeedY *= -1;

        // Ball collision with paddles
        if (ballX <= 20 && ballY > player1Y && ballY < player1Y + paddleHeight) ballSpeedX *= -1;
        if (ballX >= gameCanvas.width - 20 && ballY > player2Y && ballY < player2Y + paddleHeight) ballSpeedX *= -1;

        // Ball goes out of bounds (scoring)
        if (ballX < 0) {
            player2Score++;
            resetGame();
        }
        if (ballX > gameCanvas.width) {
            player1Score++;
            resetGame();
        }

        // Player Movement (Local Controls)
        if (wPressed && player1Y > 0) player1Y -= 4;
        if (sPressed && player1Y < gameCanvas.height - paddleHeight) player1Y += 4;
        if (upPressed && player2Y > 0) player2Y -= 4;
        if (downPressed && player2Y < gameCanvas.height - paddleHeight) player2Y += 4;

        // Send player movement via WebSocket
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "player-move", username: player1, y: player1Y }));
            socket.send(JSON.stringify({ type: "player-move", username: player2, y: player2Y }));
        }
    }

    function resetGame() {
        ballX = gameCanvas.width / 2;
        ballY = gameCanvas.height / 2;
        ballSpeedX = Math.random() > 0.5 ? 5 : -5; // Randomize starting direction
        ballSpeedY = Math.random() > 0.5 ? 3 : -3;
    }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    function keyDownHandler(event: KeyboardEvent) {
        if (event.key === "w") wPressed = true;
        if (event.key === "s") sPressed = true;
        if (event.key === "ArrowUp") upPressed = true;
        if (event.key === "ArrowDown") downPressed = true;
    }

    function keyUpHandler(event: KeyboardEvent) {
        if (event.key === "w") wPressed = false;
        if (event.key === "s") sPressed = false;
        if (event.key === "ArrowUp") upPressed = false;
        if (event.key === "ArrowDown") downPressed = false;
    }

    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

    gameLoop();
}
