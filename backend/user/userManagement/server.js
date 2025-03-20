import fastify from "fastify";
import fastifySqlite from './plugins/db_plugin.js';
import RegisterRoutes from "./routes/auth/registerRoutes.js";
import LoginRoutes from "./routes/auth/loginRoutes.js";
import { friendRequestRoute, processFriendRequestRoute } from "./routes/friends/friends.js";
import { loadQueryFile } from "./utils/utils_1.js";
import bcrypt from 'bcrypt'
import { compileFunction } from "vm";
import db_test from './plugins/db_plugin2.js';

// Creation of the app  instance
const server = fastify({ loger: true });


// Only for tests
server.get('/',  async(request, response) => {
	
	response.header('content-type', 'application/json');
	let tmp = await server.db.all('SELECT * FROM users');
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
		await server.register(fastifySqlite, { dbPath: './user.db'});
		await server.register(db_test, { dbPath: './user.db'});
		await server.register(RegisterRoutes);
		await server.register(LoginRoutes);
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
			server.db.run(content);
		});

	} catch(err) {
		console.error('Entrou no cath do start');
		console.error(err);
	}
}

start();

