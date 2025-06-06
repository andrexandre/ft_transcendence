export default function jwtHandler(fastify, options) {
  fastify.post('/token/updateToken', async (request, reply) => {
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

  fastify.post('/token/generateToken', async (request, reply) => {

	const { username } = request.body;
	const response = await fetch('http://user_management:3000/api/tokenInfo', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json'},
			body: JSON.stringify({ username })
		});
	if (!response.ok)
		return reply.status(401).send({message: (await response.json()).message});

    const payload = await fastify.prepareTokenData(response, "email");
    const token = await fastify.generateToken(payload);
    reply.status(200).setCookie("token", token, {
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
  });

  fastify.get('/token/verifyToken', async(request, reply) => {
      try{
        await request.jwtVerify();
		const payload = await fastify.parseToReadableData(request.cookies.token);
		reply.status(200).send(payload);
      }catch(err){
        reply.status(403);
        return err;
      }
  });
}