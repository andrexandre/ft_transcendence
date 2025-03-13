function gameData(fastify, options) {
    fastify.get("/userData", (request, reply) => {
        reply.status(200).send(fastify.setPayload(request.cookies.token));
    });
}

export default gameData;