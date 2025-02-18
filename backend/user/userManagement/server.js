import fastify from "fastify";
import fastifySqlite from './database_plugin.js'
// import sqlite from 'node:sqlite'

// Creation of the app  instance
const server = fastify({logger: true});

server.register(fastifySqlite);

server.ready((err) => {
	if (err) {
		console.log('Nao funcionou');
	} else {
		console.log('funcionou');
		server.sqlite.run("CREATE TABLE alex (info TEXT)");
	}
});
// server.printPlugins();


// console.log(server);


// server.register(function plugin (app, opts, next) {
// 	console.log('');
// 	next()
// });
// console.log(server);

// server.get('/', (request, response) => {

// 	response.header('content-type', 'application/json');
// 	response.send({message: " Now we are working"});
// });


// const listenOptions = {
// 	port: `${process.env.PORT}`,
// 	host: '0.0.0.0'
// }

// server.listen(listenOptions, () => {
// 	console.log(`Server is running on port: ${process.env.PORT}`);
// });