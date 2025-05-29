export default function jwtHandler(fastify, options) {
  fastify.post('/updateToken', async (request, reply) => {
    const { username } = request.body;
    const payload = await fastify.parseToReadableData(request.cookies.token);
    payload.username = username;
    const token = await fastify.generateToken(payload);
    reply.setCookie('token', token, {
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    }).status(200);
  })

  fastify.get('/generateToken', async (request, reply) => {
    const payload = await fastify.prepareTokenData(response, "email");
    const token = await fastify.generateToken(payload);
    reply.status(200).setCookie("token", token, {
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
  });
}