// const { WebSocketServer } = require('ws');

// function setupWebSocketServer(server) {
//   const wss = new WebSocketServer({ server });

//   wss.on('connection', (ws) => {
//     console.log('Player connected');

//     ws.on('message', (message) => {
//       console.log(`Received: ${message}`);
//       // Example: Echo the message back for test
//       ws.send(`Echo: ${message}`);
//     });

//     ws.on('close', () => {
//       console.log('Player disconnected');
//     });
//   });

//   console.log('WebSocket server ready');
// }

// module.exports = { setupWebSocketServer };