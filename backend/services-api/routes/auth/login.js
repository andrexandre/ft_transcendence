
function loginRoute(fastify, options) {

    fastify.post('/login', async (request, reply) => {
        const { username, password } = request.body;
        const payload = {
            username: username,
            password: password
        };
        const response = await fetch('https://nginx-gateway:80/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
		
        if(!response.ok)
			    reply.status(response.status);
		reply.status(200).send(await response.json());
    });
}

export default loginRoute;