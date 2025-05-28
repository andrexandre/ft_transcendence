export class GameEngine {
    ball = { x: 400, y: 300, dx: 4, dy: 4 };
    paddles = { left: 150, right: 150 };
    paddleSpeed = 5;
    updatePaddle(player, direction) {
        if (direction === "up")
            this.paddles[player] -= this.paddleSpeed;
        else
            this.paddles[player] += this.paddleSpeed;
    }
    update() {
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        if (this.ball.y <= 0 || this.ball.y >= 600)
            this.ball.dy *= -1;
        if (this.ball.x <= 20 && this.ball.y >= this.paddles.left && this.ball.y <= this.paddles.left + 100) {
            this.ball.dx *= -1;
        }
        if (this.ball.x >= 780 && this.ball.y >= this.paddles.right && this.ball.y <= this.paddles.right + 100) {
            this.ball.dx *= -1;
        }
    }
    getState() {
        return { ball: this.ball, paddles: this.paddles };
    }
}
