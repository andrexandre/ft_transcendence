import bcrypt from 'bcrypt'
import { json } from 'stream/consumers';


async function RegisterRoute(server, opts) {
    
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
				await server.createUser(username, email, hashedPassword, 'email');
            } catch(err) {
				// console.log(err);
				// console.log(err.name);
				// console.log(err.message);
				// console.log(err.code);
				// console.log(err.errno);
				// console.log(err.stack);
				// console.log(JSON.stringify(err));
                if (err.code === 'SQLITE_CONSTRAINT') {
					const msg = (err.message.includes("email")) ? 'Email' : 'Username'; // true
					response.status(409).send({message: `${msg} already exist!`});
				} else {
					response.status(500).send({message: `${err}`});
				} 
				
            }
            // Ver se coloco a resosta dentro do throw
            response.status(201).send({message: `Successfully created user ${username} ${email}`});
        },
    });
}


export default RegisterRoute;
