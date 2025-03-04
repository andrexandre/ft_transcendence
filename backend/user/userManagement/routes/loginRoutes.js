import bcrypt from 'bcrypt'


async function LoginRoutes(server, opts) {
    
    server.route({
        method: 'POST',
        url: '/api/login',
        schema: {
            body: {
                type: 'object',
                required: [ 'username', 'password' ],
                properties: {
                    username: { type: 'string' },
                    password: { type: 'string' },
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    }
                },
            },
        },
    
        handler:  async (request, response) => {

            const { username, password } = request.body;
            let user;
            try {
                user = await server.getUserByUsername(username);
                console.log(user);
                const login = await bcrypt.compare(password, user.password);

                if (login != true) {
                    throw('Wrong password');
                } else {
                    // Criar os token aqui e colocar eles nas cookies
                }

            } catch(err) {
                // ver depois o erro para ver a mensagem e o status
                // 404 user dont exist
                // erro no compare
                response.status(404).send({message: err});
            }

            response.status(200).send({message: `Welcome to my Transcendence ${user.username}`});
        },
    });
}

export default LoginRoutes;