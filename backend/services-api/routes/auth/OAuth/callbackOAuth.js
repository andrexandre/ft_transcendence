async function callbackOAuth(fastify, options) {
    fastify.get('/callback', async (req, reply) => {
        try {
          const { token } = await fastify.google.getAccessTokenFromAuthorizationCodeFlow(req);
          const payload = await fastify.parseToReadableOAuth(token.access_token);
          const jwtToken = await fastify.generateToken(await setPayload(payload));
          reply.setCookie('token', jwtToken, {
            path: '/',
            httpOnly: false,
            secure: true,
            sameSite: 'lax'
          });
          return reply.redirect(`https://127.0.0.1:5500`).status(200);
        } catch (err) {
          reply.status(500).send(err);
        }
    });   
}

async function setPayload(payload){
  const response = await fetch('https://nginx-gateway:80/api/login/googleSign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  payload.userId = data.userId;
  payload.username = data.username;
  delete payload.email;
  return payload;
}

export default callbackOAuth;