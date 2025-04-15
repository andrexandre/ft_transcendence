import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyCookie from "@fastify/cookie";
import cors from '@fastify/cors';
import { createLobby, joinLobby } from './lobbyManager.js';
import { userRoutes } from './userSet.js';

const PORT = 5000;
const gameserver = Fastify({ logger: true });

await gameserver.register(fastifyWebsocket);
gameserver.register(fastifyCookie);
gameserver.register(userRoutes);
await gameserver.register(cors, {
	origin: ['http://127.0.0.1:5500'],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
	credentials: true,
});



gameserver.get('/ws', { websocket: true }, (connection, req) => {
  connection.on('message', (msg) => {
    try {
      const data = JSON.parse(msg.toString());

      if (data.type === 'create-lobby') {
        const lobbyId = createLobby(connection);
        connection.send(JSON.stringify({ type: 'lobby-created', lobbyId }));
      }

      if (data.type === 'join-lobby') {
        const playerId = joinLobby(data.lobbyId, connection);
        if (playerId) {
          connection.send(JSON.stringify({ type: 'lobby-joined', playerId }));
        } else {
          connection.send(JSON.stringify({ type: 'error', message: 'Could not join lobby' }));
        }
      }

    } catch (err) {
      connection.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });
});


gameserver.listen({ port: PORT, host: "0.0.0.0" }, () => {
	console.log(`🚀 Game server running on ws://localhost:${PORT}`);
});

