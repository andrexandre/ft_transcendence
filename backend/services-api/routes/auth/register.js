function registerRoute(fastify, options){
    fastify.post('/register', async (request, reply) => {
        const { username, email, password } = request.body;
        const payload = {
            username: username,
            email: email,
            password: password
        };
        const response = await fetch('https://nginx-gateway:80/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
		if (!response.ok) {
			const errorData = await response.json();
			reply.status(errorData.statusCode).send(errorData);
			return;
		}
        reply.status(201).send(await response.json());
    });
}
export default registerRoute;