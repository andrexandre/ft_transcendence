async function setProtectedRoutes(fastify, options) {
    fastify.addHook('onRequest', async (request, reply) => {
        try{
            await request.jwtVerify();
        } catch (err) {
            reply.status(403);
            return err;
        }
    });
}

export default setProtectedRoutes;