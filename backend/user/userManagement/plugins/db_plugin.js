import {open} from 'sqlite';
import sqlite3 from 'sqlite3';
import fp from 'fastify-plugin';
import {
	createUser, 
	getUserByUsername,
	updateUserAvatar,
	updateUserStatus,
	updateUser2FAStatus,
	updateUserInformation,
	createTables
} from '../decorators/db_decorators.js'

async function dbPlugin(fastify, options) {

	const modes = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;
	const connection = await open({
		filename: options.dbPath,
		driver: (sqlite3.verbose().Database),
		mode: modes
	});

	fastify.log.info('Sucessful connection to database!');
	if (!fastify.sqlite) {
		fastify.decorate('sqlite', connection);
		// (name, function, 'decorators dependencies')
		fastify.decorate('createUser', createUser, ['sqlite']);
		fastify.decorate('createTables', createTables, ['sqlite']);
		fastify.decorate('getUserByUsername', getUserByUsername, ['sqlite']);
		fastify.decorate('updateUserAvatar', updateUserAvatar, ['sqlite']);
		fastify.decorate('updateUserStatus', updateUserStatus, ['sqlite']);
		fastify.decorate('updateUser2FAStatus', updateUser2FAStatus, ['sqlite']);
		fastify.decorate('updateUserInformation', updateUserInformation, ['sqlite']);
	}
	
	fastify.addHook('onClose', (fastify, done) => connection.end().then(done).catch(done));
}

export default fp(dbPlugin, {name: 'db'});
