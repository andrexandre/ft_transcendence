function fetchDashboardData(fastify, options) {
    fastify.get('/fetchDashboardData', async (request, reply) => {
        reply.send(await fastify.parseToReadableData(request.cookies.token));
    });
}

export default fetchDashboardData;