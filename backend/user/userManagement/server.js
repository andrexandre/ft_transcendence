// Dependencies
import fastify from "fastify";

// Routes
import LoginRoute from "./routes/auth/loginRoutes.js";
import googleSignRoute from "./routes/auth/googleSign.js";
import RegisterRoute from "./routes/auth/registerRoutes.js";
import { friendRequestRoute, processFriendRequestRoute } from "./routes/friends/friends.js";

// Utils
import { loadQueryFile } from "./utils/utils_1.js";

// Plugins
import db_test from './plugins/db_plugin.js';


// Creation of the app  instance
const server = fastify({ loger: true });

// Only for tests
server.addHook('onRequest', (request, reply, done) => {
    console.log(`[${request.method}] ${request.url}`);
    done();
});

// Only for tests
server.get('/',  async(request, response) => {
	
	response.header('content-type', 'application/json');
	let tmp = await server.sqlite.all('SELECT * FROM users');
	if (tmp.length > 0 ) {
		tmp = tmp.map(item => ({
		...item,
		friends: JSON.parse(item.friends)
		}));
	}

	response.send(JSON.stringify(tmp, null, 2));
});

const listenOptions = {
	port: `${3000}`,
	host: '0.0.0.0'
}


async function start() {
	
	try {
		// Ver como registrar todas as routes com auto-load
		await server.register(db_test, { dbPath: './user.db'});
		await server.register(RegisterRoute);
		await server.register(LoginRoute);
		await server.register(googleSignRoute);
		await server.register(friendRequestRoute);
		await server.register(processFriendRequestRoute);
		
		server.listen(listenOptions, async () => {
			
			console.log(`Server is running on port: 3000`);
			let content;
			try {
				content = await loadQueryFile('../queries/create_tables.sql');
			} catch(err) {
				console.error(err);
				process.exit(1);

			}
			console.log(content);
			server.sqlite.run(content);
		});

	} catch(err) {
		console.error('Entrou no cath do start');
		console.error(err);
	}
}

start();

