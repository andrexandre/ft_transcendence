function registerRoute(fastify, options){
    fastify.post('/register', {
        schema: {
          body: {
            type: 'object',
            required: ['username', 'email', 'password'],
            properties: {
              username: { type: 'string', minLength: 3, maxLength: 20 },
              password: { type: 'string', minLength: 5, maxLength: 25},
              email: {type: 'string', format: 'email'},
            }
          }
        }
        }, async (request, reply) => {
        const { username, email, password } = request.body;
        const payload = {
            username: username,
            email: email,
            password: password
        };
        const response = await fetch('http://user_management:3000/api/users', {
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