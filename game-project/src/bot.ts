// src/bot.ts
import { MatchState } from "./matchManager.js";

// Define uma configuração para o intervalo de reação do bot com base na dificuldade
const configByDifficulty = {
	Easy: { interval: 1000 },   // 1 segundo entre decisões
	Normal: { interval: 500 },  // 0.5 segundos entre decisões
	Hard: { interval: 250 }     // 0.25 segundos entre decisões
} as const;

// Memória do bot por jogo (gameId), guarda onde ele quer mover-se (targetY) e quando foi a última atualização
const botMemory = new Map<string, { targetY: number; lastUpdate?: number }>();

// Função principal que actualiza o movimento do bot num determinado jogo
export function updateBotPlayer(match: MatchState) {
	const gameId = match.gameId;         // ID do jogo atual
	const bot = match.players[1];        // Assume-se que o bot está sempre na posição 1 do array de jogadores
	const ball = match.ball;             // Bola atual do jogo

	// Se o bot não estiver no lado direito do campo (posiX ≠ 100), ignora
	if (bot.posiX !== 100) return;

	// Determina a dificuldade do bot (by default, "Normal")
	type Difficulty = keyof typeof configByDifficulty;
	const difficulty = (match.aiDifficulty || "Normal") as Difficulty;

	// Obtém a configuração correspondente à dificuldade atual
	const config = configByDifficulty[difficulty];

	// Se não existir memória para este jogo, inicializa com targetY = 50
	if (!botMemory.has(gameId)) {
		botMemory.set(gameId, { targetY: 50 });
	}
	const memory = botMemory.get(gameId)!;

	// Verifica se já passou tempo suficiente para o bot "pensar" novamente
	if (!memory.lastUpdate || Date.now() - memory.lastUpdate > config.interval) {
		// Atualiza o Y onde o bot deve tentar alinhar a raquete com base na previsão do movimento da bola
		memory.targetY = predictBallIntersectionY(ball, 100); // 100 representa a posição X do bot (lado direito)
		memory.lastUpdate = Date.now(); // Guarda o momento da última atualização
	}

	// Calcula o centro vertical atual da raquete do bot
	const paddleCenterY = (bot.posiY / 100) * 600 - 40;

	// Decide se o bot deve subir ou descer com base na posição prevista da bola
	if (paddleCenterY < memory.targetY - 8) {
		simulateBotKey(bot, "down");
	} else if (paddleCenterY > memory.targetY + 8) {
		simulateBotKey(bot, "up"); 
	}
}

// Simula o movimento da raquete do bot para cima ou para baixo
function simulateBotKey(bot: MatchState["players"][number], direction: "up" | "down") {
	if (direction === "up") {
		bot.posiY = Math.max(0, bot.posiY - 0.8); // sobe, sem ultrapassar o topo
	} else {
		bot.posiY = Math.min(100, bot.posiY + 0.8); // desce, sem ultrapassar o fundo
	}
}

// Calcula onde a bola vai intersectar o lado do bot (posição X = paddleX)
function predictBallIntersectionY(ball: MatchState["ball"], paddleX: number): number {
	let { x, y, dx, dy } = { ...ball }; // Copia a posição e direção da bola

	// Simula o movimento da bola até que atinja a extremidade esquerda ou direita do campo
	while ((dx > 0 && x < 790) || (dx < 0 && x > 10)) {
		x += dx;
		y += dy;

		// Reflete a bola verticalmente se tocar no topo ou fundo do campo
		if (y <= 0 || y >= 590) dy *= -1;

		// Sai do ciclo quando a bola estiver suficientemente próxima da extremidade
		if ((dx > 0 && x >= 790) || (dx < 0 && x <= 10)) {
			break;
		}
	}

	// Retorna a posição Y prevista onde a bola vai intersectar a linha vertical do bot
	return y;
}
