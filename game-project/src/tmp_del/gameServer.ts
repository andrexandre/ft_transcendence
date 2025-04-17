// import type { WebSocket } from "ws";

// type Player = {
// 	username: string;
// 	userId: number;
// 	posiY: number;
// 	posiX: number; 
// 	score: number;
// };

// // Constantes
// const updateFPS = 1000 / 60;
// const winingValue = 2;
// const ballSize = 10;
// const canvasWidth = 800;
// const canvasHeight = 600;
// const paddleHeight = 80;
// const paddleWidth = 10;
// const ball = { x: 400, y: 300, vx: 5, vy: 3 };
// const clients = new Map<WebSocket, Player>();

// export function handleJoin(socket: WebSocket, data: any) {
//     if (clients.size >= 2) {
//         socket.send(JSON.stringify({ type: "full" }));
// 		socket.close();
// 		return;
// 	}
    
// 	const player: Player = {
// 		username: data.username ?? "Guest",
// 		userId: data.userId ?? 0,
// 		posiY: 50,
//         posiX: clients.size === 0 ? 0 : 90,
// 		score: 0,
// 	};
    
// 	clients.set(socket, player);
// 	socket.send(JSON.stringify({ type: "welcome", playerId: player.userId.toString() }));
// 	console.log(`✅ ${player.username} joined`);
// }

// export function handleMove(socket: WebSocket, direction: string) {
//     const player = clients.get(socket);
// 	if (!player) return;
    
// 	if (direction === "up") player.posiY = Math.max(0, player.posiY - 5);
// 	if (direction === "down") player.posiY = Math.min(100, player.posiY + 5);
// }

// export function handleDisconnect(socket: WebSocket) {
//     const player = clients.get(socket);
// 	if (player) console.log(`❌ ${player.username} (${player.userId}) disconnected`);
// 	clients.delete(socket);
// }

// function broadcast(message: object) {
// 	for (const [socket] of clients) {
// 		if (socket.readyState === socket.OPEN) {
// 			socket.send(JSON.stringify(message));
// 		}
// 	}
// }

// async function startCountdownAndResetBall() {
// 	ball.vx = 0;
// 	ball.vy = 0;

// 	const centerX = canvasWidth / 2;
// 	const centerY = canvasHeight / 2;
// 	ball.x = centerX;
// 	ball.y = centerY;

// 	for (let i = 3; i > 0; i--) {
// 		broadcast({ type: "countdown", value: i });
// 		await new Promise((res) => setTimeout(res, 1000));
// 	}

// 	ball.vx = (Math.random() > 0.5 ? 1 : -1) * 5;
// 	ball.vy = (Math.random() > 0.5 ? 1 : -1) * 3;
// }


// export function startGameLoop() {
//     setInterval(() => {
//         if (clients.size < 2) return;
        
// 		const [p1, p2] = Array.from(clients.values());
        
// 		ball.x += ball.vx;
// 		ball.y += ball.vy;
        
// 		// Wall collision
// 		if (ball.y <= 0 || ball.y >= canvasHeight - ballSize) ball.vy *= -1;
        
// 		// Paddle collision
// 		const paddleY1 = (p1.posiY / 100) * (canvasHeight - paddleHeight);
// 		const paddleY2 = (p2.posiY / 100) * (canvasHeight - paddleHeight);

//         // rework this /////////////////////////////////////////////////
// 		if (ball.x <= 10 + paddleWidth &&
// 			ball.y >= paddleY1 && ball.y <= paddleY1 + paddleHeight) {
//                 ball.vx *= -1;
//                 ball.x = 20;
// 		}
// 		if (ball.x >= canvasWidth - 10 - ballSize &&
// 			ball.y >= paddleY2 && ball.y <= paddleY2 + paddleHeight) {
// 				ball.vx *= -1;
// 				ball.x = canvasWidth - 20;
// 		}
		
// 		// Score
// 		if (ball.x < 0) {
// 			p2.score += 1;
// 			startCountdownAndResetBall();
// 		}
// 		if (ball.x > canvasWidth) {
// 			p1.score += 1;
// 			startCountdownAndResetBall();
// 		}
                
// 		const state = {
// 			players: [p1, p2],
// 			ball,
// 		};

// 		broadcast({ type: "update", state });
// 		// Win
// 		if (p1.score >= winingValue || p2.score >= winingValue) {
// 			const winner = p1.score > p2.score ? p1 : p2;
// 			broadcast({ type: "end", winner: winner.username });
			
// 			saveMatchToDatabase(
// 				p1.userId,
// 				p2.userId,
// 				p1.score,
// 				p2.score,
// 				"Matrecos",
// 				winner.userId
// 			);
			
// 			clients.clear();
// 			clients.forEach((value, key) => {
// 				key.close();
// 			});
// 			startCountdownAndResetBall();
// 			return;
// 		}
// 	}, updateFPS);
// }

// async function saveMatchToDatabase( 
// 	player1Id: number,
// 	player2Id: number,
// 	player1Score: number,
// 	player2Score: number,
// 	gameMode: string,
// 	winnerId: number
// ) {
// 	try {
// 		const response = await fetch("http://127.0.0.1:5000/save-match", {
// 			method: "POST",
// 			headers: { "Content-Type": "application/json" },
// 			body: JSON.stringify({
// 				player1Id,
// 				player2Id,
// 				player1Score,
// 				player2Score,
// 				gameMode,
// 				winnerId,
// 			}),
// 		});
// 		if (!response.ok) throw new Error("Failed to save match");
// 		console.log("✅ Match saved to database");
// 	} catch (error) {
// 		console.error("❌ Error saving match:", error);
// 	}
// }
