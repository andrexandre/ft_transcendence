import fastify from "fastify";
// import fastifySqlite from './database_plugin.js'
// import sqlite from 'node:sqlite'

// Creation of the app  instance
const server = fastify({logger: true});

// server.register(fastifySqlite);

server.get('/', (request, response) => {

	response.header('content-type', 'application/json');
	response.send({message: " Now we are working"});
});


const listenOptions = {
	port: `${process.env.PORT}`,
	host: '0.0.0.0'
}

server.listen(listenOptions, () => {
	console.log(`Server is running on port: ${process.env.PORT}`);
});