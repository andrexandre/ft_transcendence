// Dependencies
import fastify from "fastify";
import fastifyCookie from '@fastify/cookie';
import fastifySensible from "@fastify/sensible";
import fastifyMultipart from '@fastify/multipart'
import fastifyCors from "@fastify/cors"; // temporario
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Utils
import { errorResponseSchema } from "./utils/error.js";

// Plugins
import db from './plugins/db_plugin.js';

// Creation of the app  instance
const server = fastify({ loger: true });

server.register(fastifyCors, {
	origin: [`http://127.0.0.1:5500`, `http://nginx-gateway:80`, `http://${process.env.IP}:5500`], // Allow frontend origin
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	credentials: true // Allow cookies if needed
});

const ajv = new Ajv({ allErrors: true, $data: true, formats: { email: true }});
ajvErrors(ajv)
server.setValidatorCompiler(({ schema }) => {
	return ajv.compile(schema)
})

server.setErrorHandler(function (error, request, reply) {
	if (error.validation) {
	  // Pegamos todas as mensagens customizadas do AJV no erro
	  const messages = error.validation.map((err) => err.message);
  
	  // Aqui você pode customizar a resposta, por exemplo, só enviar a primeira mensagem, sem prefixo
	  reply.status(400).send({
		error: 'Bad Request',
		message: messages.join('; ') // só as mensagens customizadas
	  });
	} else {
	  // Para outros erros, manda o padrão
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
		// Ver como registrar todas as routes com auto-load
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
		console.log('Routes: ', server.printRoutes());
		// console.log('Routes: ', server.printRoutes({ includeHooks: true, commonPrefix: false }));

	} catch(err) {
		console.error('Entrou no cath do start');
		console.error(err);
		process.exit(1);
	}
}

start();
