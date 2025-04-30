
import * as settingsControllers from '../controllers/user/userSettings.js';
import * as registerControllers from '../controllers/user/userRegister.js';
import * as avatarControllers from '../controllers/user/userAvatar.js';
import { UserNotFoundError } from '../utils/error.js';
import registerSchema from '../schemas/user/registerSchema.js';

async function extractInformationFromToken(request, reply) {
	try {
		const response = await fetch('http://gateway-api:7000/userData', {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Cookie": `token=${request.cookies.token}`,
			},
			credentials: "include"
		});

		// throw
		if (!response.ok) reply.status(401).send({error: "User not authenticated!"});

		const userData = await response.json();
		request.authenticatedUser = await this.getUserById(userData.userId);
		// if (!request.targetUser)
		// 	throw new UserNotFoundError();
	} catch (err) {
		console.log(err);
		reply.status(500).send({error: "Internal server error!"});
		return;
	}
}

async function userRoutes(server, opts) {
    
	server.route({ method: 'POST', url: '/api/users', schema: registerSchema, handler: registerControllers.register });

	// Settings Routes
	server.route({ method: 'GET', url: '/api/users/settings', onRequest: extractInformationFromToken , handler:  settingsControllers.getSettings });
	// User PUT or PATCH to update
	server.route({ method: 'POST', url: '/api/users/save-settings', onRequest: extractInformationFromToken , handler: settingsControllers.saveSettings });
	server.route({ method: 'POST', url: '/api/users/save-settings-2fa', onRequest: extractInformationFromToken , handler: settingsControllers.save2faSettings });

	// Avatar Routes
	server.route({ method: 'GET', url: '/api/users/avatar', onRequest: extractInformationFromToken , handler: avatarControllers.getAvatar });
	server.route({ method: 'GET', url: '/api/users/:username/avatar', onRequest: extractInformationFromToken , handler: avatarControllers.getProfileAvatar });
	// User PUT or PATCH to update
	server.route({ method: 'POST', url: '/api/users/update/avatar', onRequest: extractInformationFromToken , handler: avatarControllers.saveAvatar });

	server.route({
		method: 'GET',
		url: '/api/users/:username',
		schema: {
			params: {
				type: 'object',
				required: ['username'],
				properties: {
				  username: { type: 'string', minLength: 1 }
				}
			}
		},
		onRequest: extractInformationFromToken,
		handler:  async (request, reply) => {
			
			try {
				const { username } = request.params;
				const user = await server.getUserByUsername(username);
				if (!user)
					throw new UserNotFoundError();
				reply.send({
					username: user.username,
					email: user.email,
					codename: user.codename,
					biography: user.biography
				});
				return;

			} catch(err) {
				reply.status(404).send(err.formatError());
				return;
			}
		}
	});
}

export default userRoutes;
