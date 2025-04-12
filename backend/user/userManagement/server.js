// Dependencies
import fastify from "fastify";
import fastifyCookie from '@fastify/cookie';
import fastifyCors from "@fastify/cors"; // temporario

// Routes
import LoginRoute from "./routes/auth/loginRoutes.js";
import googleSignRoute from "./routes/auth/googleSign.js";
import RegisterRoute from "./routes/auth/registerRoutes.js";
import userRoutes from "./routes/userRoutes/userRoutes.js";

// Utils
import { errorResponseSchema } from "./utils/error.js";

// Plugins
import db from './plugins/db_plugin.js';

// Creation of the app  instance
const server = fastify({ loger: true });

server.register(fastifyCors, {
	origin: ['http://127.0.0.1:5500'], // Allow frontend origin
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	credentials: true // Allow cookies if needed
});

// Only for tests
server.addHook('onRequest', (request, reply, done) => {
    console.log(`[${request.method}] ${request.url}`);
    done();
});

// Only for tests
server.get('/',  async(request, response) => {
	
	response.header('content-type', 'application/json');
	let tmp = await server.sqlite.all('SELECT * FROM users');

	response.send(JSON.stringify(tmp, null, 2));
});

const listenOptions = {
	port: `${3000}`,
	host: '0.0.0.0'
}

async function start() {
	
	try {
		// Ver como registrar todas as routes com auto-load
		server.addSchema(errorResponseSchema);
		await server.register(db, { dbPath: './user.db'});
		await server.register(RegisterRoute);
		await server.register(LoginRoute);
		await server.register(googleSignRoute);
		await server.register(userRoutes);
		await server.register(fastifyCookie);
		
		server.listen(listenOptions, async () => {
			
			console.log(`Server is running on port: 3000`);
			try {
				await server.createTables();
				console.log("Tables Created!")
			} catch(err) {
				console.error(err);
				process.exit(1);
			}
		});

	} catch(err) {
		console.error('Entrou no cath do start');
		console.error(err);
	}
}

start();

