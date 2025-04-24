
import userSettingsRoutes from "./userSettingsRoutes.js";
import userAvatarRoutes from "./userAvatarRoutes.js";

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

}

export default userRoutes;
