import _fastify from 'fastify'
import fastifyStatic from '@fastify/static';
import fastifyWebsocket from '@fastify/websocket';
import path, { join } from 'path';
import { createUser, initializeDatabase } from './database/db.js';
import { SocketHandler } from './socket/socket_handler.js';
import { Server } from 'socket.io';
// const fastify = require('fastify')();
// const { createServer } = require('node:http');
// const { join } = require('node:path');
// const { Server } = require('socket.io');
// const { mainModule } = require('node:process');
// const { initializeDatabase } = require('./database/db.js');
// const fastifyStatic = require('@fastify/static');
// const { publicDecrypt } = require('node:crypto');
// const { createUser } = require('./database/db.js');
// const { Socket } = require('node:dgram');
// const { users, sockets } = require('./socket/socket_handler.js');
// const { bindSocket } = require('./socket/socket_handler.js');

const fastify = _fastify();
const port = 2000;

async function setupServer() {
	await fastify.register(fastifyStatic, {
		root: join(import.meta.dirname, 'public'),
		prefix: '/'
	});

	/* fastify.addHook('onRequest', async (request, reply) => {
		console.log(`Incoming request: ${request.method} ${request.url}`);
	}); */

	fastify.get('/', async (request, reply) => {
		const username = request.query.user;

		if (!username)
			return reply.send('Please provide a username in the URL (e.g., /?user=Antony)');
		await createUser(username);
		return reply.sendFile('index.html');
	});

	fastify.get('/ws', { websocket: true }, (connection, req) => {
        SocketHandler(connection, req);
    });

	return fastify;
}

async function main() {

	try {
		const server = await setupServer();
		const db = await initializeDatabase();

		await server.listen({ port: port });
		console.log(`Server running at http://localhost:${port}`);
	}
	catch (error) {
		console.error("Error: ", error);
		process.exit(1);
	}
}

main();
