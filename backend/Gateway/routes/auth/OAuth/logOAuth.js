async function loginOAuth(fastify, options) {
    fastify.get('/loginOAuth', async (req, reply) => {
        const authURL = fastify.google.generateAuthUrl({
            scope: ['email', 'profile'],
        });
        reply.redirect(authURL);
    });
}

export default loginOAuth;