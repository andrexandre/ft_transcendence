import bcrypt from 'bcrypt';

async function LoginRoute(server, opts) {
    
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
                        userID: { type: 'string' },
                        username: { type: 'string' },
                    }
                },
            },
        },
    
        handler:  async (request, response) => {
            
            const { username, password } = request.body;
			let resContent;
            // let user;
            // let hash;
            try {
                const user = await server.getUserByUsername(username);
                if (!user) {
                    throw({status: 404, message: 'User not found!'});
                }
                const login = await bcrypt.compare(password, user.password);

                if (login != true) {
                    throw({status: 401, message: 'Wrong password!'});
                } else {
					await server.updateUserStatus(user.username);

					resContent = {
						userID: `${user.id}`,
						username: `${user.username}`
					};
                }

            } catch(err) {

				(err.status) ? 
                response.status(err.status).send({message: `${err.message}`}) : response.status(500).send({message: `${err}`});
                // ver depois o erro para ver a mensagem e o status
                // 404 user dont exist
                // erro no compare "Error: data and hash arguments required"
                // response.status(404).send({message: err});
            }

            response.status(200).send(resContent);
        },
    });
}

export default LoginRoute;