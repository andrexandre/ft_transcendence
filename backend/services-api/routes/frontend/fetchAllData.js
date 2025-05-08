function fetchDashboardData(fastify, options) {
    fastify.get('/fetchDashboardData', async (request, reply) => {
        //reply.send(await fastify.parseToReadableData(request.cookies.token));
        const payload = await fastify.parseToReadableData(request.cookies.token);
        payload.game = "heelo";
        reply.status(200).send(payload);
    });
}

export default fetchDashboardData;