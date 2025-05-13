
function loginRoute(fastify, options) {

    fastify.post('/login', {
        schema: {
          body: {
            type: 'object',
            required: ['username', 'password'],
            properties: {
              username: { type: 'string', minLength: 3, maxLength: 20 },
              password: { type: 'string', minLength: 5, maxLength: 25},
            }
          }
        }
        },async (request, reply) => {
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
            reply.status(200).setCookie("token", token, {
                path: '/',
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
            });
            return reply.send(payload);
        }
        else{
            reply.status(response.status);
        }
    });
}

export default loginRoute;