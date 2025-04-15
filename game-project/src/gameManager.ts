type Player = {
    socket: WebSocket;
    id: string;
  };
  
  type Game = {
    id: string;
    players: [Player, Player];
    // Add state like ball position, scores, etc.
  };
  
  const games = new Map<string, Game>();
  
  export function handleConnection(socket: WebSocket) {
    // For now, just echo for test
    socket.onmessage = (msg) => {
      console.log('Received:', msg.data);
      socket.send(`echo: ${msg.data}`);
    };
  
    socket.onclose = () => {
      console.log('Client disconnected');
    };
  }
  