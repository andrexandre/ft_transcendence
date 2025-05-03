
import * as settingsControllers from '../controllers/user/userSettings.js';
import * as registerControllers from '../controllers/user/userRegister.js';
import * as avatarControllers from '../controllers/user/userAvatar.js';
import registerSchema from '../schemas/user/registerSchema.js';
import two_FA_settings_schema from '../schemas/user/twoFaSettingsSchema.js'

async function extractInformationFromToken(request, reply) {
	try {
		const response = await fetch('http://gateway-api:7000/userData', {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Cookie": `token=${request.cookies.token}`,
			},
		});

		if (!response.ok)
			this.httpErrors.unauthorized('Missing credentials!');

		const userData = await response.json();
		request.authenticatedUser = await this.getUserById(userData.userId);
		if (!request.authenticatedUser)
			throw this.httpErrors.notFound('User not found!');
		
	} catch (err) {
		if (err.statusCode)
			reply.status(err.statusCode).send(err);
		else
			reply.status(500).send({statusCode: 500, error: "Internal server error", message: 'Error fetching resources!'});
		return;
	}
}

async function userRoutes(server, opts) {
    
	server.route({ method: 'POST', url: '/api/users', schema: registerSchema, handler: registerControllers.register });

	// Settings Routes
	server.route({ method: 'GET', url: '/api/users/settings', onRequest: extractInformationFromToken , handler:  settingsControllers.getSettings });
	server.route({ method: 'GET', url: '/api/users/two-fa-secret', onRequest: extractInformationFromToken , handler:  settingsControllers.get2faSecret });
	// User PUT or PATCH to update
	server.route({ method: 'POST', url: '/api/users/save-settings', onRequest: extractInformationFromToken , handler: settingsControllers.saveSettings });
	server.route({ method: 'POST', url: '/api/users/save-settings-2fa', schema: two_FA_settings_schema, onRequest: extractInformationFromToken , handler: settingsControllers.save2faSettings });

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
