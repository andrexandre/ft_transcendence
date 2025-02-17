import FastifyPlugin from 'fastify-plugin';
import sqlite3 from 'sqlite3';

const FILEPATH = './database/user.db';


function fastifySqlite(fastify, options, done) {

	const modes = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;
	const connection = new sqlite3.Database(FILEPATH, modes, (err) => {
    if (err) {
      console.log('Failed to connect to database!');
    }
    console.log('Sucessful connection to database!');
  }).verbose();

  if (!fastify.sqlite) {
    fastify.decorate('sqlite', connection);
  }

  fastify.addHook('onClose', (fastify, done) => connection.end().then(done).catch(done));

  done();
}

export default FastifyPlugin(fastifySqlite, { name: 'fastify-mysql-example' });