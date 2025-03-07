export default async function(fastify, options) {
     fastify.post('/api/genToken', async (request, reply) => {
        const { username, userId } = request.body;
        const payload = { username, userId };
        const token = fastify.jwt.sign(payload, {expiresIn: '1h'});
        reply.status(200).send(JSON.stringify({"token":token}));
    });
}