const fastify = require('fastify')();
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const { mainModule } = require('node:process');
const { initializeDatabase } = require('./database/db.js');
const { SocketHandler } = require('./socket/socket_handler.js');
const fastifyStatic = require('@fastify/static');
const { publicDecrypt } = require('node:crypto');
const { createUser } = require('./database/db.js');
const { Socket } = require('node:dgram');
const { users, sockets } = require('./socket/socket_handler.js');
const { bindSocket } = require('./socket/socket_handler.js');

const port = 3000;

async function setupServer()
{
	await fastify.register(fastifyStatic, {
		root: join(__dirname, 'public'),
		prefix: '/'
	});

	
	/* fastify.addHook('onRequest', async (request, reply) => {
		console.log(`Incoming request: ${request.method} ${request.url}`);
	}); */
	
	fastify.get('/chat', async (request, reply) => {
		const username = request.query.user;

		if(!username)
			return reply.send('Please provide a username in the URL (e.g., /?user=Antony)');
		createUser(username);
		bindSocket(username);
		return reply.sendFile('index.html');
	});
	
	const io = new Server(fastify.server);
	SocketHandler(io);

	return fastify;
}

async function main()
{

	try {
		const server = await setupServer();
		const db = await initializeDatabase();
		
		await server.listen({port : port});
		console.log(`Server running at http://localhost:${port}/chat`);
	}
	catch (error) {
		console.error("Error: ", error);
		process.exit(1);
	}
}

main();
