import { generateToken } from "../../plugins/jwtGenerator.js";

function loginRoute(fastify, options) {

    fastify.post('/login', async (request, reply) => {
        const { username, password } = request.body;
        const payload = {
            username: username,
            password: password
        };
        const token = generateToken(fastify, payload.username, 1);
        const response = await fetch('http://user_management:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if(response.status == 200){
            console.log(1);      
        }
        else{
            reply.status(response.status);
        }
    });
}

export default loginRoute;