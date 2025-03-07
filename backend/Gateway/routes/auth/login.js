import fastifyCookie from '@fastify/cookie'

function loginRoute(fastify, options) {
    
    fastify.register(fastifyCookie);

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
            reply.status(response.status).setCookie('username', payload.username, {
                path: '/',
                httpOnly: true,
                maxAge: 3600,
            });
            return ;
        }
        reply.status(response.status);
    });
}

export default loginRoute;