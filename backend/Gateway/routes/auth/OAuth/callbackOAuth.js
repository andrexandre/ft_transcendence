async function callbackOAuth(fastify, options) {
    fastify.get('/callback', async (req, reply) => {
        try {
          const { token } = await fastify.google.getAccessTokenFromAuthorizationCodeFlow(req);
          const payload = await fastify.parseToReadableOAuth(token.access_token);
          const jwtToken = await fastify.generateToken(payload);
          reply.redirect('http://127.0.0.1:5500').status(200).setCookie('token', jwtToken, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'Strict'
          });
        } catch (err) {
          reply.status(500).send(err);
        }
    });   
}

export default callbackOAuth;