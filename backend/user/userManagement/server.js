import fastify from "fastify";
import fastifySqlite from './database_plugin.js'


// Creation of the app  instance
const server = fastify({logger: true });

server.register(fastifySqlite, { dbPath: './user.db'}).after((err) => {
	if (err) {
		console.log('Nao funcionou');
		process.exit(1);
	}
	server.log.info('Database registred');
});


server.post('/create_user', (request, response) => {
	console.log(request.body);
	console.log(request.headers);
	// const tmp = JSON.stringify(request.body)
	const { name, apelido } = request.body;
	server.sqlite.run(`INSERT INTO users (nome, apelido) VALUES ('${name}', '${apelido}');`);
	
	response.send({message: `Sucessifuly created ${name} ${apelido}`});
});


server.get('/', async (request, response) => {
	
	response.header('content-type', 'application/json');
	await server.sqlite.each("SELECT id, nome, apelido FROM users", (err, row) => {
		if (err) {
			console.error(err);
		} else {
			console.log(row.id + ": " + row.nome + ' ' + row.apelido);
		}
    });
	response.send({message: `Everything okay`});

	// server.sqlite.get("SELECT * FROM users", (err, row) => {
	// 	if (err) {
	// 		console.log(err);
	// 	} else if (row) {
	// 		console.table(row);
	// 		response.send({message: " Now we are working"});
	// 	} else {
	// 		console.log("Esta empty");
	// 	}
	// });
});

// {
//     "name":"Alexsandro",
//     "Apelido":"moreira",
//     "username":"aleperei",
// }



const listenOptions = {
	port: `${3000}`,
	host: '0.0.0.0'
}

server.listen(listenOptions, () => {
	console.log(`Server is running on port: ${process.env.PORT}`);
	server.sqlite.run("CREATE TABLE IF NOT EXISTS users ( id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, apelido TEXT);");
});
