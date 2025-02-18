async function userData(fastify, options) {
    fastify.post('/user-data', (request, reply) => {
        const { username } = request.body;
        reply.status(200).send({Message : "Request received", Data : username});
        console.log(username);
    });
}

module.exports = userData