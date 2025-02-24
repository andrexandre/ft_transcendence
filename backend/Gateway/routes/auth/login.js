function loginRoute(fastify, options) {
    fastify.post('/login', async (request, reply) => {
        const { username, password } = request.body;
        console.log("USERNAME AND USER : ",username, password);
        reply.status(200).send("OK");
    });
}

module.exports = loginRoute;