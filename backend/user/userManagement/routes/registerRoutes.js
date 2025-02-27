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
        
                server.sqlite.run(`INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${hashedPassword}');`);
                // Protecao caso algum username ou email ja estiver a ser usado
        
            } catch {
                response.status(500).send({message: `Internal server error`})
            }
        
            
            response.status(201).send({message: `Successfully created user ${username} ${email}`});
        },
    });
}


export default RegisterRoutes;
