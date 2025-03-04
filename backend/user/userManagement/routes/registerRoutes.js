import bcrypt from 'bcrypt'


async function RegisterRoutes(server, opts) {
    
    server.route({
        method: 'POST',
        url: '/api/create',
        schema: {
            body: {
                type: 'object',
                required: [ 'username', 'email', 'password' ],
                properties: {
                    username: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                }
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    }
                },
            },
        },
    
        handler:  async (request, response) => {
           
            const { username, email, password } = request.body;
            try {
                // Password hashing
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                await server.registerUsers(username, email, hashedPassword);
            } catch(err) {

                (err.status) ? 
                response.status(err.status).send({message: `${err.message}`}) : response.status(500).send({message: `${err}`});
                // if (err.status) {
                //     // User ou email ja existe 409
                //     // Ver se faco o schema depois
                //     response.status(err.status).send({message: `${err.message}`});
                // } else {
                //     // Se uma das funcoes dar erro genSalt ou o hash 500
                //     response.status(500).send({message: `${err}`})
                // }
            }
            // Ver se coloco a resosta dentro do throw
            response.status(201).send({message: `Successfully created user ${username} ${email}`});
        },
    });
}


export default RegisterRoutes;
