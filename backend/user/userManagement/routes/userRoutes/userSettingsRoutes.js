

async function userSettingsRoutes(server, opts) {
    
	server.route({
        method: 'GET',
        url: '/api/users/settings',
        handler:  async (request, reply) => {
           
			console.log('AuthenticatedUser: ', request.authenticatedUser);
			reply.status(200).send({
				username: request.authenticatedUser.username,
				email: request.authenticatedUser.email,
				codename: request.authenticatedUser.codename,
				biography: request.authenticatedUser.biography,
				auth_method: request.authenticatedUser.auth_method,
				two_FA_status: request.authenticatedUser.two_FA_status
			});
        }
    });

    server.route({
        method: 'POST',
        url: '/api/users/save-settings',
        handler:  async (request, reply) => {
			try {

				console.log('AuthenticatedUser: ', request.authenticatedUser);
				await server.updateUserInformation(request.body, request.authenticatedUser.id);
				reply.status(200).send({message: "Successfully update the information!"});

			} catch (err) {
				// error if username/email already exist
				reply.status(500).send({error: "Internal server error!"});
				return; 
			}
		}
	});

	server.route({
        method: 'POST',
        url: '/api/users/save-settings-2fa',
        handler:  async (request, reply) => {

			try {
				
				console.log('AuthenticatedUser: ', request.authenticatedUser);
				await server.updateUser2FAStatus(request.body, request.authenticatedUser.id);
				reply.status(200).send({message: "Successfully update the information!"});

			} catch (err) {
				// dataBase errors
				reply.status(500).send({error: "Internal server error!"});
				return;
			}

		}}
	)

}

export default userSettingsRoutes;
