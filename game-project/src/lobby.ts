// import { FastifyInstance } from "fastify";
// import { GameEngine } from "./gameEngine";

// const game = new GameEngine();
// const clients = new Map<any, string>();

// export default async function lobbyRoutes(fastify: FastifyInstance) {
//   fastify.get("/lobby", { websocket: true }, (connection, req) => {
//     const { socket } = connection;
//     const playerId = `player-${clients.size + 1}`;

//     console.log(`Player connected: ${playerId}`);
//     clients.set(socket, playerId);
//     game.addPlayer(playerId);

//     // Send initial game state
//     socket.send(JSON.stringify({ type: "gameState", state: game.getState() }));

//     // Handle messages
//     socket.on("message", (message: string) => {
//       try {
//         const data = JSON.parse(message);
//         if (data.type === "move") {
//           game.movePlayer(playerId, data.direction);
//         }
//       } catch (err) {
//         console.error("Invalid message:", err);
//       }
//     });

//     // Handle disconnect
//     socket.on("close", () => {
//       console.log(`Player disconnected: ${playerId}`);
//       clients.delete(socket);
//       game.removePlayer(playerId);
//     });
//   });

//   // Sync game state every 100ms
//   setInterval(() => {
//     const gameState = JSON.stringify({ type: "gameState", state: game.getState() });
//     clients.forEach((_, ws) => ws.send(gameState));
//   }, 100);
// }
