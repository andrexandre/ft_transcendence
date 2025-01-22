const { WebSocketServer } = require('ws');
const { gameState } = require('../gameEngine');

function setupWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('Player connected');
    ws.send(JSON.stringify(gameState)); // Send initial game state

    ws.on('message', (message) => {
      const data = JSON.parse(message);

      if (data.type === 'move') {
        const { player, direction } = data; // { type: 'move', player: 1, direction: 'up' }
        const paddle = gameState.paddles[player - 1];

        // Update paddle position based on direction
        if (direction === 'up' && paddle.y > 0) paddle.y -= 5;
        if (direction === 'down' && paddle.y < 80) paddle.y += 5;
      }
    });

    ws.on('close', () => {
      console.log('Player disconnected');
    });
  });

  console.log('WebSocket server ready');
  return wss; // Return WebSocketServer instance
}

module.exports = { setupWebSocketServer };
