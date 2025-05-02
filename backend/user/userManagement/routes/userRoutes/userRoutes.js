
import userSettingsRoutes from "./userSettingsRoutes.js";
import userAvatarRoutes from "./userAvatarRoutes.js";
import { UserNotFoundError } from "../../utils/error.js";

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
    
	server.addHook('onRequest', extractInformationFromToken);

	server.register(userSettingsRoutes);
	server.register(userAvatarRoutes);

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
