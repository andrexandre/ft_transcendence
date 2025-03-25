import fastify from 'fastify'
import fastifyStatic from '@fastify/static';
import fastifyWebsocket from '@fastify/websocket';
import path, { join, dirname } from 'path';
import { createUser, initializeDatabase } from './database/db.js';
import { SocketHandler } from './socket/socket_handler.js';
import { fileURLToPath } from 'url';

const server_chat = fastify();
const port = 2000;
let username;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupServer() {	
	await server_chat.register(fastifyStatic, {
		root: join(__dirname, 'public'),
		prefix: '/'
	});

	await server_chat.register(fastifyWebsocket);

	/* server_chat.addHook('onRequest', async (request, reply) => {
		console.log(`Incoming request: ${request.method} ${request.url}`);
	}); */

	server_chat.get('/', async (request, reply) => {
		username = request.query.user;

		if (!username)
			return reply.send('Please provide a username in the URL (e.g., /?user=Antony)');
		await createUser(username);
		return reply.sendFile('index.html');
	});

	server_chat.get('/chat-ws', { websocket: true }, async (connection, req) => {
		try {
			SocketHandler(connection, username);
		} catch (error) {
			console.error('Error in WebSocket handler:', error);
			connection.socket.close();
		}
    });

}

async function main() {

	try {
		await setupServer();
		const db = await initializeDatabase();

		await server_chat.listen({ port: port });
		console.log(`Server running at http://localhost:${port}`);
	}
	catch (error) {
		console.error("Error: ", error);
		process.exit(1);
	}
}

main();
