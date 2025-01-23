const express = require('express');
const { createServer } = require('http');
const { setupWebSocketServer } = require('./server/wsServer');
const { setupAPIRoutes } = require('./server/api');
const { updateGameState, gameState, updateBotPaddle } = require('./gameEngine');

const app = express();
const httpServer = createServer(app);

// Setup REST API
setupAPIRoutes(app);

// Setup WebSocket server
const wss = setupWebSocketServer(httpServer);

// Game loop to update game state and broadcast to clients
setInterval(() => {
  updateGameState(); // Update ball position and game logic
  updateBotPaddle(); // Update bot's paddle movement
}, 1000 / 120); // Increased to 120 FPS for smoother updates

setInterval(() => {
  // Broadcast updated game state separately for rendering
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(gameState));
    }
  });
}, 1000 / 60); // Retain 60 FPS for rendering



// Start the server
const PORT = 5050;
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
