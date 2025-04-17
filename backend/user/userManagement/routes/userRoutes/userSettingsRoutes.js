

async function userSettingsRoutes(server, opts) {
    
	server.route({
        method: 'GET',
        url: '/api/user/settings',
        handler:  async (request, reply) => {
           
			const token = request.cookies.token;
			const response = await fetch('http://gateway-api:7000/userData', {
				method: "GET",
				headers: {
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
				biography: targetUser.biography,
				two_FA_status: targetUser.two_FA_status
			});
            
        },
    });

    server.route({
        method: 'POST',
        url: '/api/users/save-settings',
        handler:  async (request, reply) => {

			try {
				const token = request.cookies.token;
				const response = await fetch('http://gateway-api:7000/userData', {
					method: "GET",
					headers: {
						"Cookie": `token=${token}`,
					},
					credentials: "include"
				});
	
				if (!response.ok) reply.status(500).send({error: "Internal server error!"});

				const userData = await response.json();
				const targetUser = await server.getUserByUsername(userData.username);

				await server.updateUserInformation(request.body, targetUser.id);
				return reply.status(200).send({message: "Successfully update the information!"})

			} catch (err) {
				return reply.status(500).send({error: "Internal server error!"});
			}

		}}
	);

	server.route({
        method: 'POST',
        url: '/api/users/save-settings-2fa',
        handler:  async (request, reply) => {

			try {
				const token = request.cookies.token;
				const response = await fetch('http://gateway-api:7000/userData', {
					method: "GET",
					headers: {
						"Cookie": `token=${token}`,
					},
					credentials: "include"
				});
	
				if (!response.ok) reply.status(500).send({error: "Internal server error!"});

				const userData = await response.json();
				const targetUser = await server.getUserByUsername(userData.username);

				await server.updateUser2FAStatus(request.body, targetUser.id);
				return reply.status(200).send({message: "Successfully update the information!"})

			} catch (err) {
				return reply.status(500).send({error: "Internal server error!"});
			}

		}}
	)

}

export default userSettingsRoutes;
