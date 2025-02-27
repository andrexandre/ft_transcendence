const fastifyCookie = require('@fastify/cookie')

function gameData(fastify, options) {
    fastify.register(fastifyCookie);

    fastify.get('/set-cookie', async (request, reply) => {
        reply.status(200).setCookie('username', 'CaxaPorra');
        // testar em http://127.0.0.1:7000/set-cookie
    });
}
module.exports = gameData;