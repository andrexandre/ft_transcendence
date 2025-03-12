import fastify from "fastify";
import fastifySqlite from './plugins/db_plugin.js';
import RegisterRoutes from "./routes/auth/registerRoutes.js";
import LoginRoutes from "./routes/auth/loginRoutes.js";
import {friendsRoutes1} from "./routes/friends/friends.js";
import fs from 'fs/promises';
import url from 'url';
import path from 'path';
import bcrypt from 'bcrypt'
import { compileFunction } from "vm";

// Creation of the app  instance
const server = fastify({ loger: true });

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function loadQueryFile(fileName) {
	const filePath = path.join(__dirname, fileName);
	// const content = fs.readFile(filePath, 'utf8').catch(err => {throw "File Not found";});
	return fs.readFile(filePath, 'utf8');
}  



async function getUsers() {
	return new Promise((resolve, reject) => {
	  const content = [];
  
	  server.sqlite.each("SELECT * FROM users", (err, row) => {
		if (err) {
		  reject(err); // Rejeita a Promise em caso de erro
		} else {
		  content.push({
			id: `${row.id}`,
			username: `${row.username}`,
			email: `${row.email}`,
			password: `${row.password}`,
			is_online: `${row.is_online}`,
			friends: JSON.parse(row.friends)
		  });
		}
	  }, (err, numRows) => {
		if (err) {
		  reject(err); // Se houver erro no processo, rejeita
		} else {
		  resolve(content); // Resolve a Promise com os dados quando terminar
		}
	  });
	});
}

// {
// 	"request": true,
// 	"requestorID": 123,
// 	"requesteeID": 456,
// 	"requestStatus": ["PENDING", "ACCEPTED", "REJECTED"]
// },

async function createFriendRequest(user1, user2, id) {
	return new Promise((resolve, reject) => {

	  server.sqlite.run(`UPDATE users 
		SET friends = json_insert(friends, '$[#]',
		json_object('request', 'true', 'requestorID', '${user2.id}', 'requesteeID', '${user1.id}', 'requestStatus', "PENDING")) 
		WHERE id = ?;`, [id], (err, row) => {
		if (err) {
		  reject(err); // Rejeita a Promise em caso de erro
		} else {
		  resolve('');
		}
	  });
	});
}


// server.post('/friend-request', async (request, response) => {

// 	const { requesterUsername , requesteeUsername } = request.body;

// 	try {
// 		const requestee = await server.getUserByUsername(requesteeUsername);
// 		const requester = await server.getUserByUsername(requesterUsername);

// 		await updateFriendsRequest(requestee, requester, requestee.id);
// 		await updateFriendsRequest(requestee, requester, requester.id);
		
// 	} catch(err) {
// 		console.log(err);
// 		response.status(400).send({message: err});
// 	}
	
// 	response.status(200).send({message: "Request was maid sucefful"});
// 	// Tenho que colocar na base de dados dos dois que um pedido foi feito
// });


// Only for tests
server.get('/',  async(request, response) => {
	
	response.header('content-type', 'application/json');
	// estudar o porque que isto funciona com a solucao do chatgpt
	let content = await getUsers();

	console.log('aqui');
	// console.log(content);
		
	response.send(JSON.stringify(content, null, 2));
});

const listenOptions = {
	port: `${3000}`,
	host: '0.0.0.0'
}


async function start() {
	
	try {
		// Ver como registrar todas as routes com auto-load
		await server.register(fastifySqlite, { dbPath: './user.db'});
		await server.register(RegisterRoutes);
		await server.register(LoginRoutes);
		await server.register(friendsRoutes1);
		
		server.listen(listenOptions, async () => {
			
			console.log(`Server is running on port: 3000`);
			let content;
			try {
				content = await loadQueryFile('queries/create_tables.sql');
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

