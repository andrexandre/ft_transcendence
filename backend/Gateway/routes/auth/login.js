
function loginRoute(fastify, options) {

    fastify.post('/login', async (request, reply) => {
        const { username, password } = request.body;
        const payload = {
            username: username,
            password: password
        };
        const response = await fetch('http://user_management:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if(response.status == 200){
            const payload = await fastify.prepareTokenData(response, "email");
            const token = await fastify.generateToken(payload);
            console.log("PAYLOAD HERE: ", payload);
            reply.status(200).setCookie("token", token, {
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'Strict'
            });
            reply.send(await fastify.parseToReadableData(token));
        }
        else{
            reply.status(response.status);
        }
    });
}

export default loginRoute;