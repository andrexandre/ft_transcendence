function gameData(fastify, options) {
    fastify.register(fastifyCookie);

    fastify.get('/set-cookie', async (request, reply) => {
        reply.status(200).setCookie('username', 'Manel');
        // testar em http://127.0.0.1:7000/set-cookie
    });
}

export default gameData;