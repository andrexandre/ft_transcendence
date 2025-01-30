// Use "ws://" for local development, "wss://" for production with SSL
const socket = new WebSocket("ws://localhost:8000/ws/game/");

socket.onopen = () => {
    console.log("✅ WebSocket connection opened!");
    socket.send(JSON.stringify({ player: 1, action: "move" }));
};

socket.onmessage = (event) => {
    console.log("📩 Received:", event.data);
};

socket.onerror = (error) => {
    console.error("❌ WebSocket Error:", error);
};

socket.onclose = () => {
    console.log("🔴 WebSocket connection closed!");
};


// let socket;

// function connectWebSocket() {
//   // Connect to the WebSocket server
//   socket = new WebSocket('ws://localhost:8000/ws/game/');

//   // Log when the connection opens
//   socket.onopen = () => {
//     console.log('WebSocket connected');
//   };

//   // Handle incoming messages
//   socket.onmessage = (event) => {
//     const serverData = JSON.parse(event.data);

//     // Update game state with server data
//     if (serverData.ball) {
//       gameState.ball = serverData.ball;
//     }
//     if (serverData.paddles) {
//       gameState.paddles = serverData.paddles;
//     }
//     if (serverData.score) {
//       gameState.score = serverData.score;
//     }
//   };

//   // Log when the connection closesadwadas
//   socket.onclose = () => {
//     console.log('WebSocket disconnected');
//   };
// }

// // Send paddle movement to the server
// function sendPaddleMovement(player, direction) {
//   if (socket && socket.readyState === WebSocket.OPEN) {
//     socket.send(JSON.stringify({ type: 'move', player, direction }));
//   }
// }

// // Listen for keyboard inputs
// window.addEventListener('keydown', (e) => {
//   if (e.key === 'ArrowUp') {
//     sendPaddleMovement(1, 'up');
//   } else if (e.key === 'ArrowDown') {
//     sendPaddleMovement(1, 'down');
//   }
// });

// // Connect the WebSocket
// connectWebSocket();
