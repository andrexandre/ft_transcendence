async function callbackOAuth(fastify, options) {
    fastify.get('/callback', async (req, reply) => {
        try {
          const { token } = await fastify.google.getAccessTokenFromAuthorizationCodeFlow(req);
          const payload = await fastify.parseToReadableOAuth(token.access_token);
        } catch (err) {
          reply.status(500).send(err);
        }
    });   
}

export default callbackOAuth;