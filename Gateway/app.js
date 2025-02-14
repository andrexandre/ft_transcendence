'use strict'

const path = require('node:path')
const AutoLoad = require('@fastify/autoload')
const fastifyJwt = require('@fastify/jwt')
const sqlite3 = require('sqlite3').verbose();
const cors = require('@fastify/cors');
require('dotenv').config();

// Pass --options via CLI arguments in command to enable these options.
const options = {}
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async function (fastify, opts) {
  // Place here your custom code!

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  const db = new sqlite3.Database('../Database/testDB.db', (err) => {
    if(err){
      console.log("Error opening db : ", err.message);
    }
    else{
      console.log("Connected!");
    }
  });

  db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, email TEXT)");
  });

  module.exports = {db};

  fastify.register(cors, {
    origin: 'http://localhost:5500', // Allow frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // Allow cookies if needed
});

  fastify.register(fastifyJwt, {secret: JWT_SECRET});

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })
}

module.exports.options = options