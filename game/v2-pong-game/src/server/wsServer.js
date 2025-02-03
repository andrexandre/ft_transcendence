const WebSocket = require('ws');
const { createServer } = require('http');
const { setupWebSocketServer } = require('../src/server/wsServer');

describe('WebSocket Server', () => {
  let server, wss, client;

  beforeAll((done) => {
    // Create an HTTP server and WebSocket server
    server = createServer();
    wss = setupWebSocketServer(server);
    server.listen(4000, done);
  });

  afterAll((done) => {
    // Close the WebSocket server and HTTP server
    wss.close();
    server.close(done);
  });

  beforeEach((done) => {
    // Connect a WebSocket client to the server
    client = new WebSocket('ws://localhost:4000');
    client.on('open', done);
  });

  afterEach(() => {
    client.close();
  });

  it('should accept connections from WebSocket clients', (done) => {
    client.on('message', (message) => {
      expect(message).toBe('Welcome to Pong!');
      done();
    });

    wss.clients.forEach((ws) => ws.send('Welcome to Pong!'));
  });

  it('should echo messages back to the client', (done) => {
    const testMessage = 'Hello Server';

    client.on('message', (message) => {
      expect(message).toBe(`Echo: ${testMessage}`);
      done();
    });

    client.send(testMessage);
  });

  it('should handle client disconnections gracefully', (done) => {
    client.close();
    client.on('close', () => {
      expect(wss.clients.size).toBe(0); // All clients should be disconnected
      done();
    });
  });
});
