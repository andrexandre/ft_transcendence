import bcrypt from 'bcrypt'
import registerSchema from '../../schemas/auth/registerSchema.js';
import { json } from 'stream/consumers';


async function RegisterRoute(server, opts) {
    
    server.route({
        method: 'POST',
        url: '/api/create',
        schema: registerSchema,
        handler:  async (request, response) => {
           
            const { username, email, password } = request.body;
            try {
                // Password hashing
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
				await server.createUser(username, email, hashedPassword, 'email');
            } catch(err) {
				console.log(err);

                if (err.code === 'SQLITE_CONSTRAINT') {

					const msg = (err.message.includes("email")) ? 'Email' : 'Username';
					response.status(409).send({
						error: `${msg} already exist!`
					});
				} else {
					response.status(500).send({statusCode: 409, error: `Internel server error`});
				} 
				
            }
            // Ver se coloco a resosta dentro do throw
            response.status(201).send({message: `Successfully created user ${username} ${email}`});
			return response;
        },
    });
}


export default RegisterRoute;
