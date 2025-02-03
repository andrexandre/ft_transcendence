const canvas = document.getElementById("pongCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

// Game objects
class Paddle {
    x: number;
    y: number;
    width: number = 10;
    height: number = 80;
    speed: number = 5;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    move(up: boolean) {
        if (up && this.y > 0) this.y -= this.speed;
        if (!up && this.y < canvas.height - this.height) this.y += this.speed;
    }

    draw() {
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Ball {
    x: number = canvas.width / 2;
    y: number = canvas.height / 2;
    radius: number = 8;
    speedX: number = 4;
    speedY: number = 4;

    move() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.y <= 0 || this.y >= canvas.height) this.speedY *= -1;
    }

    draw() {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

const player = new Paddle(20, 150);
const bot = new Paddle(770, 150);
const ball = new Ball();

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();
    bot.draw();
    ball.move();
    ball.draw();
    requestAnimationFrame(updateGame);
}

updateGame();
