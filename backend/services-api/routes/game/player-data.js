function gameData(fastify, options) {
    fastify.get("/game/userData", async (request, reply) => {
        reply.status(200).send(await fastify.parseToReadableData(request.cookies.token));
    });
}

export default gameData;