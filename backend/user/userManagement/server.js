import fastify from "fastify";
import fastifySqlite from './database_plugin.js';
import fs from 'fs/promises';
import url from 'url';
import path from 'path';
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


// Colocar ele dentro de um router tipo "RegisterRoutes"
server.post('/create_user', (request, response) => {
	const { username, email, password } = request.body;
	
	// Tem que se fazer o hash da password
	server.sqlite.run(`INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${password}');`);
	// Protecao caso algum username ou email ja estiver a ser usado
	
	response.status(200).send({message: `Sucessifuly created ${username} ${email}`});
});

async function getUsers() {
	return new Promise((resolve, reject) => {
	  const content = [];
  
	  server.sqlite.each("SELECT id, username, email, password FROM users", (err, row) => {
		if (err) {
		  reject(err); // Rejeita a Promise em caso de erro
		} else {
		  content.push({
			id: `${row.id}`,
			username: `${row.username}`,
			email: `${row.email}`,
			password: `${row.password}`
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

// Only for tests
server.get('/',  async(request, response) => {
	
	response.header('content-type', 'application/json');
	// estudar o porque que isto funciona com a solucao do chat
	let content = await getUsers();
	// await server.sqlite.each("SELECT id, username, email, password FROM users", (err, row) => {
	// 	if (err) {
	// 		console.error(err);
	// 	} else {
	// 		content.push({id: `${row.id}`, username: `${row.username}`, email: `${row.email}`, password: `${row.password}`});
	// 		console.log(row.id + ": " + row.username + ' ' + row.email, + ' ' + row.password);
	// 		// console.log(content);
	// 	}
    // });

	console.log('aqui');
	console.log(content);
		
	response.send(JSON.stringify(content, null, 2));
});

const listenOptions = {
	port: `${3000}`,
	host: '0.0.0.0'
}


async function start() {
	
	try {

		await server.register(fastifySqlite, { dbPath: './user.db'});
		
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

