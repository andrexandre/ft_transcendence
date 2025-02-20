import fp from 'fastify-plugin';
import sqlite3 from 'sqlite3';


function fastifySqlite(fastify, options, done) {

	const modes = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;
	const filePath = options.dbPath || ":memory:";
	const connection = new (sqlite3.verbose().Database)(filePath, modes, (err) => {
    if (err) {
		fastify.log.error('Erro ao conectar no DB:', err);
		process.exit(1);
    } else {
		fastify.log.info('Sucessful connection to database!');
	}
  });
  
  if (!fastify.sqlite) {
    fastify.decorate('sqlite', connection);
  }

  fastify.addHook('onClose', (fastify, done) => connection.end().then(done).catch(done));

  done();
}

export default fp(fastifySqlite, {name: 'db'});