export default function jwtHandler(fastify, options){
    fastify.post('/updateToken', async (request, reply) => {
		const { username } = request.body;
        const payload = await fastify.parseToReadableData(request.cookies.token);
        payload.username = username;
        const token =  await fastify.generateToken(payload);
        reply.setCookie('token', token, {
			path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'Strict'
		}).status(200);
    })
}