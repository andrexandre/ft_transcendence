function gameData(fastify, options) {
    fastify.get("/userData", async (request, reply) => {
        reply.status(200).send(await fastify.setPayload(request.cookies.token));
    });
}

export default gameData;