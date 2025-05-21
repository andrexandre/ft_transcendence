export default function jwtHandler(fastify, options){
    fastify.post('/updateToken', (request, reply) => {
        const { username } = request.body;
        const payload = fastify.parseToReadableData(request.cookies.token);
        payload.username = username;
        const token = fastify.generateToken(payload);
        reply.setCookie('token', token, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'Strict'
          });
    })
}