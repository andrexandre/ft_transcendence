
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
            const payload = fastify.prepareTokenData(response);
            const token = fastify.generateToken(payload);
            reply.status(200).setCookie("token", token);
        }
        else{
            //console.log("Error");
            reply.status(response.status);
        }
    });
}

export default loginRoute;