import {open} from 'sqlite';
import sqlite3 from 'sqlite3';
import fp from 'fastify-plugin';
import {
	createUser, 
	getUserByUsername,
	updateUserStatus
} from '../decorators/db_decorators.js'

async function dbtest(fastify, options) {

	const modes = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;
	const connection = await open({
		filename: options.dbPath,
		driver: (sqlite3.verbose().Database),
		mode: modes
	});
	
	fastify.log.info('Sucessful connection to database!');
	if (!fastify.db) {
		fastify.decorate('db', connection);
		// (name, function, 'decorators dependencies')
		fastify.decorate('createUser', createUser, ['db']);
		fastify.decorate('getUserByUsername', getUserByUsername, ['db']);
		fastify.decorate('updateUserStatus', updateUserStatus, ['db']);
		// fastify.decorate('createFriendRequest', createFriendRequestDecorator, ['sqlite']);
		// fastify.decorate('acceptFriendRequest', acceptFriendRequestDecorator, ['sqlite']);
	}
	fastify.addHook('onClose', (fastify, done) => connection.end().then(done).catch(done));
	
}

export default fp(dbtest, {name: 'db'});
