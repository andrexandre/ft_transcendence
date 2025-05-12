function registerRoute(fastify, options){
    fastify.post('/register', async (request, reply) => {
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
        reply.status(response.status);
    });
}
export default registerRoute;