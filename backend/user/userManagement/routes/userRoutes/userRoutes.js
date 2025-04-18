
import userSettingsRoutes from "./userSettingsRoutes.js";
import userAvatarRoutes from "./userAvatarRoutes.js";

const extractInformationFromToken = 'test';

async function userRoutes(server, opts) {
    
	server.addHook('onRequest', async (request, reply) => {

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
			request.authenticatedUser = await server.getUserByUsername(userData.username);
			// if (!request.targetUser)
			// 	throw new UserNotFoundError();
		} catch (err) {
			console.log(err);
			reply.status(500).send({error: "Internal server error!"});
			return;
		}

	});

    server.route({
        method: 'GET',
        url: '/api/user/info',
        handler:  async (request, reply) => {
           
			//aqui provavlemente vai ter de ser multipart/form-data
			const token = request.cookies.token;
			const response = await fetch('http://gateway-api:7000/userData', {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Cookie": `token=${token}`,
				},
				credentials: "include"
			});

			if (!response.ok) reply.status(500).send({error: "Internal server error!"});

			const userData = await response.json();
			const targetUser = await server.getUserByUsername(userData.username);

			reply.status(200).send({
				username: targetUser.username,
				email: targetUser.email,
				codename: targetUser.codename,
				biography: targetUser.biography
			});
            
        },
    });

	server.register(userSettingsRoutes);
	server.register(userAvatarRoutes);

}

export default userRoutes;
