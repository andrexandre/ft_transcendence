
function loginRoute(fastify, options) {

    fastify.post('/login', {
        schema: {
          body: {
            type: 'object',
            required: ['username', 'password'],
            properties: {
              username: { type: 'string', minLength: 3, maxLength: 20 },
              password: { type: 'string', minLength: 3, maxLength: 25},
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
		
        if(!response.ok)
			    reply.status(response.status).send((await response.json()));
		reply.status(200).send((await response.json()));
    });
}

export default loginRoute;