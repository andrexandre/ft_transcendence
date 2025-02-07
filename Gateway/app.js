'use strict'

const path = require('node:path')
const AutoLoad = require('@fastify/autoload')
const fastifyJwt = require('@fastify/jwt')
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
