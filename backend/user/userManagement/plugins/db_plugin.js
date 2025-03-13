import fp from 'fastify-plugin';
import sqlite3 from 'sqlite3';
import { 
	registerUsersDecorator, 
	getUserByUsernameDecorator, 
	updateUserStatusDecorator,
	createFriendRequestDecorator,
	acceptFriendRequestDecorator
 } from '../decorators/db_decorators.js';


async function fastifySqlite(fastify, options) {

	const modes = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;
	const filePath = options.dbPath || ":memory:";
	const connection = new (sqlite3.verbose().Database)(filePath, modes, (err) => {
    if (err) {
      throw "Error trying to connect to dataBase!";
    } else {
      fastify.log.info('Sucessful connection to database!');
	}
  });
  
  if (!fastify.sqlite) {
    fastify.decorate('sqlite', connection);
    // (name, function, 'decorators dependencies')
    fastify.decorate('registerUsers', registerUsersDecorator, ['sqlite']);
    fastify.decorate('getUserByUsername', getUserByUsernameDecorator, ['sqlite']);
    fastify.decorate('updateUserStatus', updateUserStatusDecorator, ['sqlite']);
    fastify.decorate('createFriendRequest', createFriendRequestDecorator, ['sqlite']);
    fastify.decorate('acceptFriendRequest', acceptFriendRequestDecorator, ['sqlite']);
  }


  fastify.addHook('onClose', (fastify, done) => connection.end().then(done).catch(done));

}

export default fp(fastifySqlite, {name: 'db'});