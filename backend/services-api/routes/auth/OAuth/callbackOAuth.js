async function callbackOAuth(fastify, options) {
    fastify.get('/callback', async (req, reply) => {
        try {
          const { token } = await fastify.google.getAccessTokenFromAuthorizationCodeFlow(req);
          const payload = await fastify.parseToReadableOAuth(token.access_token);
          const jwtToken = await fastify.generateToken(await setPayload(payload));
          reply.setCookie('token', jwtToken, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'Strict'
          });
          reply.redirect(`http://${req.headers.host}:5500`).status(200);
        } catch (err) {
          reply.status(500).send(err);
        }
    });   
}

async function setPayload(payload){
  const response = await fetch('http://user_management:3000/api/login/googleSign', {
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