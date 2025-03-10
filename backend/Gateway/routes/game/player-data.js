function gameData(fastify, options) {
    fastify.get('/set-cookie',{onRequest: [fastify.verifyToken]}, async (request, reply) => {
        reply.status(200).setCookie('username', 'Manel');
    });
}

export default gameData;