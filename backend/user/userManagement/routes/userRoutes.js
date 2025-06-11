
import * as settingsControllers from '../controllers/user/userSettings.js';
import * as registerControllers from '../controllers/user/userRegister.js';
import * as avatarControllers from '../controllers/user/userAvatar.js';
import * as profileControllers from '../controllers/user/userProfile.js';
import * as settingSchemas from '../schemas/user/settingsSchemas.js';
import registerSchema from '../schemas/user/registerSchema.js';
import { profileSchema } from '../schemas/user/profileSchemas.js';

async function extractInformationFromToken(request, reply) {
	try {
		const response = await fetch('https://nginx-gateway:80/token/verifyToken', {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Cookie": `token=${request.cookies.token}`,
			},
		});

		if (!response.ok) this.httpErrors.unauthorized('Missing credentials!');

		const userData = await response.json();
		request.authenticatedUser = await this.getUserById(userData.userId);
		if (!request.authenticatedUser) throw this.httpErrors.notFound('User not found!');
		
	} catch (err) {
		if (err.statusCode)
			reply.status(err.statusCode).send(err);
		else
			console.log({statusCode: 500, message: "Internal server error", error: err});
		return;
	}
}

async function userRoutes(server, opts) {
    
	server.route({
		method: 'POST',
		url: '/api/users',
		schema: registerSchema,
		handler: registerControllers.register
	});
	
	server.route({
		method: 'GET',
		url: '/api/users/:username/two-fa-secret',
		schema: settingSchemas.get2faSecretSchema,
		handler:  settingsControllers.get2faSecret 
	});

	// Settings Routes
	server.route({
		method: 'GET',
		url: '/api/users/settings',
		schema: settingSchemas.getSettingsSchema,
		preHandler: extractInformationFromToken ,
		handler:  settingsControllers.getSettings
	});

	server.route({
		method: 'GET',
		url: '/api/users/:username/two-fa-status',
		schema: settingSchemas.get2faSecretStatus,
		handler:  settingsControllers.get2faStatus 
	});
	
	server.route({
		method: 'PUT',
		url: '/api/users/save-settings',
		schema: settingSchemas.saveSettingsSchema	,
		preHandler: extractInformationFromToken ,
		handler: settingsControllers.saveSettings
	});

	server.route({
		method: 'PUT',
		url: '/api/users/save-2fa-settings',
		schema: settingSchemas.save2faSettingSchema,
		preHandler: extractInformationFromToken ,
		handler: settingsControllers.save2faSettings
	});

	// Avatar Routes
	server.route({
		method: 'GET',
		url: '/api/users/avatar',
		preHandler: extractInformationFromToken ,
		handler: avatarControllers.getAvatar
	});

	server.route({
		method: 'PUT',
		url: '/api/users/update/avatar',
		preHandler: extractInformationFromToken ,
		handler: avatarControllers.saveAvatar
	});

	server.route({
		method: 'GET',
		url: '/api/users/:username/avatar',
		preHandler: extractInformationFromToken ,
		handler: avatarControllers.getProfileAvatar
	});

	server.route({
		method: 'GET',
		url: '/api/users/:username/info',
		schema: profileSchema,
		preHandler: extractInformationFromToken,
		handler: profileControllers.profile
	});
}

export default userRoutes;
