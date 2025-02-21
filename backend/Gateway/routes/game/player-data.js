const fastifyCookie = require('@fastify/cookie')

function gameData(fastify, options) {
    fastify.register(fastifyCookie);

    fastify.post('/player-data', (request, reply) => {
        reply.setCookie('username', 'Zecas').send('Cookie set');
    });
}
module.exports = gameData;