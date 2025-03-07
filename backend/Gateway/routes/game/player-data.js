import fastifyCookie from '@fastify/cookie'

function gameData(fastify, options) {
    fastify.register(fastifyCookie);

    fastify.get('/set-cookie', async (request, reply) => {
        reply.status(200).setCookie('username', 'Manel');
    });
}

export default gameData;