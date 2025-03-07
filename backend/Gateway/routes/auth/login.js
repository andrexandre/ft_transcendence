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
            const data = {
                username: payload.username,
                userId: 2
            };
            const resStatus = await fetch('http://gateway-api:7000/api/genToken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if(resStatus.ok){
                const data = await resStatus.json();
                const token = data.token;
                reply.status(resStatus.status).setCookie("token", token);
                return ;        
            }
        }
        else{
            reply.status(response.status)
        }
    });
}

export default loginRoute;