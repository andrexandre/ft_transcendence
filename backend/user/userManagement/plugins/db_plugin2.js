import {open} from 'sqlite';
import sqlite3 from 'sqlite3';
import fp from 'fastify-plugin';

async function dbtest(fastify, options) {


	const modes = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;
	const connection =  open({
		filename: options.dbPath,
		driver: (sqlite3.verbose().Database),
		mode: modes
	});
	
	fastify.log.info('Sucessful connection to database!');
	if (!fastify.db) {
		fastify.decorate('db', connection);
		// (name, function, 'decorators dependencies')
		// fastify.decorate('registerUsers', registerUsersDecorator, ['sqlite']);
		// fastify.decorate('getUserByUsername', getUserByUsernameDecorator, ['sqlite']);
		// fastify.decorate('updateUserStatus', updateUserStatusDecorator, ['sqlite']);
		// fastify.decorate('createFriendRequest', createFriendRequestDecorator, ['sqlite']);
		// fastify.decorate('acceptFriendRequest', acceptFriendRequestDecorator, ['sqlite']);
	}
	fastify.addHook('onClose', (fastify, done) => connection.end().then(done).catch(done));
	
}

export default fp(dbtest, {name: 'db'});
