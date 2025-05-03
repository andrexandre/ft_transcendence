
function getSettings(request, reply) {
           
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

async function saveSettings(request, reply) {
	try {

		console.log('AuthenticatedUser: ', request.authenticatedUser);
		await this.updateUserInformation(request.body, request.authenticatedUser.id);
		reply.status(200).send({message: "Successfully update the information!"});

	} catch (err) {
		// error if username/email already exist
		reply.status(500).send({error: "Internal server error!"});
		return; 
	}
}

async function save2faSettings(request, reply) {

	try {
		
		console.log('AuthenticatedUser: ', request.authenticatedUser);
		console.log('BODY: ', request.body);
		await this.updateUser2FAStatus(request.body, request.authenticatedUser.id);
		reply.status(200).send({message: "Successfully update the information!"});

	} catch (err) {
		// dataBase errors
		reply.status(500).send({error: "Internal server error!"});
		return;
	}

}

function get2faSecret(request, reply) {

	console.log('AuthenticatedUser: ', request.authenticatedUser);
	reply.status(200).send({
		secret: request.authenticatedUser.two_FA_secret
	});
}

export {
	getSettings,
	get2faSecret,
	saveSettings,
	save2faSettings
};