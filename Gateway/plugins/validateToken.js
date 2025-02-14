const fastifyCookies = require('@fastify/cookie');
const fastifyJwt = require('@fastify/jwt');
const { default: fastify } = require('fastify');
const { default: fastifyPlugin } = require('fastify-plugin');
const JWT_SECRET = process.env.JWT_SECRET;

async function validateTokens(fastify, options) {
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