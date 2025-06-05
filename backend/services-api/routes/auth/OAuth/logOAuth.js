async function loginOAuth(fastify, options) {
    fastify.get('/loginOAuth', async (req, reply) => {
        const redirectUri = `http://${req.headers.host}:5500/callback`
        const authURL = fastify.google.generateAuthUrl({
            scope: ['email', 'profile'],
            redirect_uri: redirectUri,
        });
        reply.redirect(authURL);
    });
}

export default loginOAuth;