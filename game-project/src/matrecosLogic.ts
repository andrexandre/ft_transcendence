import { MatchState, startCountdown } from "./matchManager.js";

function updateMatrecosLogic(match: MatchState) {
    // Atualizar posição da bola
    match.ball.x += match.ball.dx;
    match.ball.y += match.ball.dy;

    // Colisão com paredes
    if (match.ball.y <= 0 || match.ball.y >= 590) {
        match.ball.dy *= -1;
    }

    // Colisões com os 4 paddles
    match.players.forEach(player => {
    const paddleX = player.posiX;
    const paddleY = (player.posiY / 100) * 520;

    // Paddle dimensions
    const paddleWidth = 10;
    const paddleHeight = 80;

    // Verifica colisão
    if (
        match.ball.x >= paddleX &&
        match.ball.x <= paddleX + paddleWidth &&
        match.ball.y >= paddleY &&
        match.ball.y <= paddleY + paddleHeight
    ) {
        match.ball.dx *= -1; // inverter direção
        match.ball.dx *= 1.1; // aumentar velocidade
        match.ball.dy *= 1.1; // aumentar vertical
    }
    });

    // (Team B marca)
    if (match.ball.x < 0) {
        // Team B = player 3 e 4
        match.players[2].score++;
        match.players[3].score++;
        resetBall(match);
        return;
    }

    // (Team A marca)
    if (match.ball.x > 1000) {
        // Team A = player 1 e 2
        match.players[0].score++;
        match.players[1].score++;
        resetBall(match);
        return;
    }
}

function resetBall(match: MatchState) {
    match.ball = {
    x: 500,
    y: 300,
    dx: (Math.random() > 0.5 ? 3 : -3),
    dy: (Math.random() * 4 - 2)
    };
    startCountdown(match.gameId);
}
