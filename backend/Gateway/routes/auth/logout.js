function logoutRoute(fastify) {
    fastify.post('/logout', (request, reply) => {
        reply.send("OK!").clearCookie('token', {path: '/'});
    });
}

export default logoutRoute;