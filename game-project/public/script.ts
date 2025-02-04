const ball = document.getElementById("ball") as HTMLDivElement;
const menu = document.getElementById("menu") as HTMLDivElement;
const buttons = document.querySelectorAll("button");

let ballX = Math.random() * (menu.clientWidth - 20);
let ballY = Math.random() * (menu.clientHeight - 20);
let dx = (Math.random() > 0.5 ? 1 : -1) * 2;
let dy = (Math.random() > 0.5 ? 1 : -1) * 2;

function moveBall() {
    ballX += dx;
    ballY += dy;

    if (ballX <= 0 || ballX + 20 >= menu.clientWidth) {
        dx *= -1;
    }
    if (ballY <= 0 || ballY + 20 >= menu.clientHeight) {
        dy *= -1;
    }

    buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        const ballRect = ball.getBoundingClientRect();
        if (
            ballRect.right > rect.left &&
            ballRect.left < rect.right &&
            ballRect.bottom > rect.top &&
            ballRect.top < rect.bottom
        ) {
            dy *= -1;
        }
    });

    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;
    requestAnimationFrame(moveBall);
}

ball.style.left = `${ballX}px`;
ball.style.top = `${ballY}px`;
moveBall();
