const express = require('express');
const { createServer } = require('http');
const { setupWebSocketServer } = require('./server/wsServer');
const { setupAPIRoutes } = require('./server/api');
const { updateGameState, gameState } = require('./gameEngine');

const app = express();
const httpServer = createServer(app);

// Setup REST API
setupAPIRoutes(app);

// Setup WebSocket server
const wss = setupWebSocketServer(httpServer);

// Game loop to update game state and broadcast to clients
setInterval(() => {
  updateGameState();

  // Broadcast updated game state to all WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(gameState));
    }
  });
}, 1000 / 60); // 60 FPS

// Start the server
const PORT = 5050;
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
