function matchHistory(fastify, options) {
    fastify.post("/matchHistory", (request, reply) => {
        console.log(request.body);
    });
}

export default matchHistory;