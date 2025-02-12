import fastify from "fastify";
import sqlite from 'node:sqlite'

// Creation of the app  instance
const server = fastify({logger: true});


server.get('/', (request, response) => {

	res.header('content-type', 'application/json');
	res.send({message: " Now we are working"});
});

// const db = new sqlite.DatabaseSync('./database/user.db');

// db.exec(`
// 	CREATE TABLE data(
// 	  key INTEGER PRIMARY KEY,
// 	  value TEXT
// 	) STRICT
//   `);

// try {
// 	console.log('Tentando fechar database')
// 	db.close();
// } catch {
	
// 	console.log('Conexao nao existe')
// 	// console.log(err);
// }

// db.serialize(() => {
// 	db.run("CREATE TABLE lorem (info TEXT)");
// 	const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
//     for (let i = 0; i < 10; i++) {
//         stmt.run("Ipsum " + i);
//     }
//     stmt.finalize();

//     // Query data from the table
//     db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
//         console.log(row.id + ": " + row.info);
//     });
// });

// function createDbConnection() {

// }

const listenOptions = {
	port: `${process.env.PORT}`,
	host: '0.0.0.0'
}

server.listen(listenOptions, () => {
	console.log(`Server is running on port: ${process.env.PORT}`);
});