// Dependencies
import fastify from "fastify";
import fastifyCookie from '@fastify/cookie';
import fastifySensible from "@fastify/sensible";
import fastifyMultipart from '@fastify/multipart'
import fastifyCors from "@fastify/cors"; // temporario
import Ajv from 'ajv';
import fs from 'fs';
import ajvErrors from 'ajv-errors';

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Utils
import { errorResponseSchema } from "./utils/error.js";

// Plugins
import db from './plugins/db_plugin.js';

// Creation of the app  instance
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const server = fastify({ loger: true, 	
	https: {
		key: fs.readFileSync('/ssl/server.key'),
		cert: fs.readFileSync('/ssl/server.crt'),
	}
});

const ajv = new Ajv({ allErrors: true, $data: true, formats: { email: true }});
ajvErrors(ajv)
server.setValidatorCompiler(({ schema }) => {
	return ajv.compile(schema)
})

server.setErrorHandler(function (error, request, reply) {
	if (error.validation) {
	  const messages = error.validation.map((err) => err.message);

	reply.status(400).send({
		error: 'Bad Request',
		message: messages.join('; ')
	});
	} else {
	  reply.send(error);
	}
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
		server.addSchema(errorResponseSchema);
		server.decorateRequest('authenticatedUser', null); // To be used in the handler
		await server.register(db, { dbPath: './user.db'});
		await server.register(fastifySensible);
		await server.register(fastifyCookie);
		await server.register(fastifyMultipart, {
			limits: { fileSize: 2 * 1024 * 1024 },// Limite de 2 MB para o arquivo
			});
		await server.register(authRoutes);
		await server.register(userRoutes);
		
		const address = await server.listen(listenOptions);
		console.log(`Server is running on ${address}`);
	
		await server.createTables();
		console.log("Tables Created!");

	} catch(err) {
		console.error('Error in starting server:', err);
		process.exit(1);
	}
}

start();
