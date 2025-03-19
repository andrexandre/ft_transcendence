async function callbackOAuth(fastify, options) {
    fastify.get('/callback', async (req, reply) => {
        try {
          const token = await fastify.google.getAccessTokenFromAuthorizationCodeFlow(req);
          reply.send({"TOKEN" : token});
        } catch (err) {
          reply.status(500).send(err);
        }
    });   
}

export default callbackOAuth;