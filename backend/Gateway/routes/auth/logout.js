function logoutRoute(fastify) {
    fastify.get('/logout', (request, reply) => {
        reply.clearCookie('token', {path: '/'});
        reply.send("OK!");
    });
}

export default logoutRoute;