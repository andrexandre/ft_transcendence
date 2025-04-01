import bcrypt from 'bcrypt';
import loginSchema from '../../schemas/auth/loginSchema.js';
import {
	UserNotFoundError,
	WrongPasswordError,
	GoogleDefaulLoginError
} from '../../utils/error.js'

async function LoginRoute(server, opts) {
    
    server.route({
        method: 'POST',
        url: '/api/login',
        schema: loginSchema,
    
        handler:  async (request, response) => {
            
            const { username, password } = request.body;
			let resContent;
            try {
                const user = await server.getUserByUsername(username);
                if (!user)
                    throw new UserNotFoundError();
				else if (user.auth_method === 'google')
					throw new GoogleDefaulLoginError();
                
				const login = await bcrypt.compare(password, user.password);
                if (login != true) 
                    throw new WrongPasswordError();

				await server.updateUserStatus(user.username);

				resContent = {
					userID: `${user.id}`,
					username: `${user.username}`
				};

            } catch(err) {
				(err.status) ? 
                response.status(err.status).send(err.formatError()) : response.status(500).send({statusCode: 500, errorMessage: 'Internal server error!'});
            }

            response.status(200).send(resContent);
        },
    });
}

export default LoginRoute;