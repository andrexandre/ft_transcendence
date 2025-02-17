const fastifyCookies = require('@fastify/cookie');
const fastifyJwt = require('@fastify/jwt');
const { default: fastify } = require('fastify');
const { default: fastifyPlugin } = require('fastify-plugin');
const fastifyEnv = require('@fastify/env');

const options = {
    schema: {
        type: 'object',
        properties: {
          JWT_SECRET_LOADER: { type: 'string' }
        }
      }
}


async function validateTokens(fastify, options) {
    const JWT_SECRET = process.env.JWT_SECRET_LOADER;
    fastify.register(fastifyCookies);
    fastify.register(fastifyJwt, { secret: JWT_SECRET });
    fastify.decorate('tokenValidator', (request, reply) => {
    try{
        const { token } = request.cookies;
        if(!token) throw new Error('Unhautorized');
        
        request.user = fastify.jwt.verify(token);
    } catch(err){
        reply.status(401).send({Error : 'Unhautorized'});
    }
    });
}

module.exports = fastifyPlugin(validateTokens);