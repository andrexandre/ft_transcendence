function logoutRoute(fastify, options) {
    fastify.get('/service/logout', (request, reply) => {
        reply.clearCookie('token', {path: '/'});
        reply.send("OK!");
    });
}

export default logoutRoute;