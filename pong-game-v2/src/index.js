const express = require('express');
const { createServer } = require('http');
const { setupWebSocketServer } = require('./server/wsServer');
const config = require('config');

const app = express();
const httpServer = createServer(app);

// REST API
app.get('/', (req, res) => res.send('Pong Game Service Running'));

// Setup WebSocket server
setupWebSocketServer(httpServer);

// Start HTTP server
const PORT = config.get('port') || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
