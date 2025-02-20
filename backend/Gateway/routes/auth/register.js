function registerRoute(fastify, options){
    fastify.post('/register', async (request, reply) =>{
        const { username } = request.body;
        const reqApelido = "test";
        const payload = {
            name : username,
            apelido: reqApelido
        };

        const response = await fetch('http://user_management:3000/create_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        reply.status(200).send(response);
    });
}

module.exports = registerRoute;