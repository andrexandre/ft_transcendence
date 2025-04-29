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
        const response = await fetch('http://user_management:3000/api/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        reply.status(response.status);
    });
}
export default registerRoute;