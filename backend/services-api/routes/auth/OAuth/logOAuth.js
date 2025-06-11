async function loginOAuth(fastify, options) {
    fastify.get('/loginOAuth', async (req, reply) => {
        const redirectUri = `https://127.0.0.1:7000/callback`
        const authURL = fastify.google.generateAuthUrl({
            scope: ['email', 'profile'],
            redirect_uri: redirectUri,
        });
        reply.redirect(authURL);
    });
}

export default loginOAuth;