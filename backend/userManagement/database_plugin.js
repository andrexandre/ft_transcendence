import FastifyPlugin from 'fastify-plugin';
import sqlite3 from 'sqlite3';
const filePath = './database/user.db';

const mysql = require('mysql2/promise')

function fastifySqlite(fastify, options, done) {
//   const connection = mysql.createConnection(options)
	const modes = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;
	const connection = sqlite3.Database(filePath, modes);

  if (!fastify.sqlite) {
    fastify.decorate('sqlite', connection)
  }

  fastify.addHook('onClose', (fastify, done) => connection.end().then(done).catch(done))

  done()
}

export default FastifyPlugin(fastifySqlite, { name: 'fastify-mysql-example' })