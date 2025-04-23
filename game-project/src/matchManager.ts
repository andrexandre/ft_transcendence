// src/matchManager.ts
import { getGamePlayers } from './lobbyManager.js';

const winnigScore = 2;

interface PlayerState {
  id: number;
  username: string;
  posiY: number;
  posiX: number;
  score: number;
}

type MatchState = {
  gameId: string;
  players: PlayerState[];
  ball: { x: number; y: number; dx: number; dy: number };
  interval: NodeJS.Timeout;
  paused: boolean;
};

const matches = new Map<string, MatchState>();
const matchSockets = new Map<string, WebSocket[]>();

export function handleMatchConnection(gameId: string, connection: any) {
  const players = getGamePlayers(gameId);
  
  if (!players) {
    console.log(`❌ Game ID not found: ${gameId}`);
    connection.send(JSON.stringify({ type: "error", message: "Game not found" }));
    connection.close();
    return;
  }
  
  console.log(`🔗 Nova ligação de jogador no gameId ${gameId}`);
  if (!matchSockets.has(gameId)) {
    matchSockets.set(gameId, []);
    console.log(`🆕 Sala criada para jogo ${gameId}`);
  }
  
  matchSockets.get(gameId)!.push(connection);
  console.log(`👥 Total de sockets no jogo ${gameId}: ${matchSockets.get(gameId)!.length}`);
  
  // Init estado do jogo apenas 1x
  if (!matches.has(gameId)) {
    const matchState: MatchState = {
      gameId,
      players: players.map((p, index) => ({
        id: p.userId,
        username: p.username,
        posiY: 50,
        posiX: index === 1 ? 0 : 100,
        score: 0
      })),
      ball: { x: 400, y: 300, dx: 3, dy: 3 },
	  paused: true,
      interval: setInterval(() => updateMatchState(gameId), 1000 / 60)
    };
    matches.set(gameId, matchState);
    startCountdown(gameId); 
    console.log(`🧠 Estado inicial criado para jogo ${gameId}`);
  }
  
  // Enviar id
  const user = connection.user;
  if (user) {
    connection.send(JSON.stringify({
      type: "welcome",
      playerId: user.userId,
      username: user.username
    }));
  }
  
  connection.on("message", (msg: string) => {
    try {
      const data = JSON.parse(msg.toString());
      const match = matches.get(gameId);
      const sockets = matchSockets.get(gameId);
      
      if (!match || !sockets) return;
      
      const index = sockets.indexOf(connection);
      if (index === -1) return;
  
      const player = match.players[index];
      if (!player) return;
  
      if (data.type === "move") {
        if (data.direction === "up") {
          player.posiY = Math.max(0, player.posiY - 3);
        } else if (data.direction === "down") {
          player.posiY = Math.min(100, player.posiY + 3);
        }
      }
  
    } catch (err) {
      console.error("❌ Invalid message:", err);
      connection.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
    }
  });

  connection.on("close", () => {
    console.log(`❌ Player desconectado do jogo ${gameId}`);
    const remaining = matchSockets.get(gameId)?.filter(c => c !== connection);
    if (!remaining || remaining.length === 0) {
      matchSockets.delete(gameId);
      const match = matches.get(gameId);
      if (match) clearInterval(match.interval);
      matches.delete(gameId);
      console.log(`🧹 Match ${gameId} limpo (todos os jogadores saíram)`);
    } else {
      matchSockets.set(gameId, remaining);
      console.log(`👥 Jogadores restantes: ${remaining.length}`);
    }
  });
}

function updateMatchState(gameId: string) {
	const match = matches.get(gameId);
	if (!match || match.paused) return;

	// Ball movement
	match.ball.x += match.ball.dx;
	match.ball.y += match.ball.dy;

	// Colisão com paredes
	if (match.ball.y <= 0 || match.ball.y >= 600 - 10) match.ball.dy *= -1;

	// Colisão com jogadore
	match.players.forEach(player => {
		const px = (player.posiX / 100) * 800;
		const py = (player.posiY / 100) * 600;

		if ( match.ball.x >= px && match.ball.x <= px + 10 && match.ball.y >= py && match.ball.y <= py + 80)
			match.ball.dx *= -1;
	});
	// Win condition
	// Verificar pontuação
if (match.ball.x < 0) {
	match.players[1].score++;
  
	if (match.players[1].score >= winnigScore) {
	  match.paused = true;
	  sendCountdown(matchSockets.get(gameId));
	  setTimeout(() => endMatch(gameId, match.players[1].username), 4000);
	} else {
	  resetBall(gameId);
	}
	return;
  }
  
  if (match.ball.x > 800) {
	match.players[0].score++;
  
	if (match.players[0].score >= winnigScore) {
	  match.paused = true;
	  sendCountdown(matchSockets.get(gameId));
	  setTimeout(() => endMatch(gameId, match.players[0].username), 4000);
	} else {
	  resetBall(gameId);
	}
	return;
  }
  

	// Enviar estado para os jogadores
	const sockets = matchSockets.get(gameId);
	if (!sockets) return;

	sockets.forEach((sock, index) => {
		const player = match.players[index]; 
		if (sock.readyState === sock.OPEN) {
		sock.send(JSON.stringify({
			type: "update",
			you: player.username,
			state: {
			players: match.players,
			ball: { x: match.ball.x, y: match.ball.y }
			}
		}));
		}
	});
}

function startCountdown(gameId: string) {
	const match = matches.get(gameId);
	const sockets = matchSockets.get(gameId);
	if (!match || !sockets) return;

	match.paused = true; 
	let count = 3;

	const countdown = setInterval(() => {
	sockets.forEach(sock => {
		if (sock.readyState === sock.OPEN) {
		sock.send(JSON.stringify({ type: "countdown", value: count }));
		}
	});
	count--;
	if (count === 0) {
		clearInterval(countdown);
		match.paused = false; 
	}
	}, 1000);
}
  
function endMatch(gameId: string, winner: string) {
	const sockets = matchSockets.get(gameId);
	if (!sockets) return;

	sockets.forEach(sock => {
		if (sock.readyState === sock.OPEN) {
		sock.send(JSON.stringify({ type: "end", winner }));
		}
	});

	clearInterval(matches.get(gameId)?.interval);
	matches.delete(gameId);
	matchSockets.delete(gameId);
	console.log(`🏁 Match ${gameId} terminado. WINNER: ${winner}`);
}

function sendCountdown(sockets: WebSocket[] | undefined) {
	if (!sockets) return;
	let count = 3;
	const interval = setInterval(() => {
	  sockets.forEach(sock => {
		if (sock.readyState === sock.OPEN)
		  sock.send(JSON.stringify({ type: "countdown", value: count }));
	  });
	  count--;
	  if (count === 0) clearInterval(interval);
	}, 1000);
}

function resetBall(gameId: string) {
	const match = matches.get(gameId);
	if (!match) return;
  
	match.ball = { x: 400, y: 300, dx: 3, dy: 3 };
	startCountdown(gameId); 
  }