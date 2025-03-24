export function startFreeForAll(username: string, opponent: string, playerIndex: number) {
    const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    const menu = document.getElementById("menu") as HTMLDivElement;

    
    canvas.width = 800;
    canvas.height = 400;

    menu.classList.add("hidden");
    canvas.style.visibility = "visible";

    let playerY = canvas.height / 2 - 40;
    let opponentY = canvas.height / 2 - 40;
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballSpeedX = 5 * (playerIndex === 0 ? 1 : -1);
    let ballSpeedY = 3;

    const paddleHeight = 80;
    const paddleSpeed = 2.5;
    let up = false, down = false;

    document.addEventListener("keydown", e => {
        if (e.key === "ArrowUp") up = true;
        if (e.key === "ArrowDown") down = true;
    });
    document.addEventListener("keyup", e => {
        if (e.key === "ArrowUp") up = false;
        if (e.key === "ArrowDown") down = false;
    });

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "blue";
        ctx.fillRect(playerIndex === 0 ? 0 : canvas.width - 10, playerY, 10, paddleHeight);

        ctx.fillStyle = "red";
        ctx.fillRect(playerIndex === 0 ? canvas.width - 10 : 0, opponentY, 10, paddleHeight);

        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.font = "20px monospace";
        ctx.fillText(`${username} vs ${opponent}`, canvas.width / 2 - 100, 20);
    }

    function update() {
        if (up && playerY > 0) playerY -= paddleSpeed;
        if (down && playerY < canvas.height - paddleHeight) playerY += paddleSpeed;

        ballX += ballSpeedX;
        ballY += ballSpeedY;

        if (ballY <= 0 || ballY >= canvas.height) ballSpeedY *= -1;
    }

    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    loop();
}
