function logoutRoute(fastify) {
    fastify.post('/logout', (request, reply) => {
        reply.clearCookie('token', {path: '/'});
        reply.send("OK!");
    });
}

export default logoutRoute;