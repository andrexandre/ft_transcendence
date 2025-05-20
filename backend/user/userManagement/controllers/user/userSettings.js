
function getSettings(request, reply) {
           
	console.log('AuthenticatedUser: ', request.authenticatedUser);
	reply.status(200).send({
		username: request.authenticatedUser.username,
		email: request.authenticatedUser.email,
		codename: request.authenticatedUser.codename,
		biography: request.authenticatedUser.biography,
		two_FA_status: request.authenticatedUser.two_FA_status
	});
}

async function saveSettings(request, reply) {
	try {

		await this.updateUserInformation(request.body, request.authenticatedUser.id);
		reply.status(200).send({message: "Successfully update the information!"});

	} catch (err) {
		if (err.code === 'SQLITE_CONSTRAINT') {
            const msg = (err.message.includes("email")) ? 'Email' : 'Username';
            reply.status(409).send({statusCode: 409, error: "Conflict", message: `${msg} already exist!`});
        } else {
            reply.status(500).send({statusCode: 500, error: "Internal server error", message: 'Error in updating information'});
        } 
	}
	return; 
}

async function save2faSettings(request, reply) {

	try {
		
		console.log('AuthenticatedUser: ', request.authenticatedUser);
		console.log('BODY: ', request.body);
		await this.updateUser2FAStatus(request.body, request.authenticatedUser.id);
		reply.status(200).send({message: "Successfully updated 2FA!"});

	} catch (err) {
		// dataBase errors
		reply.status(500).send({statusCode: 500, error: "Internal server error", message: 'Error in updating 2FA'});
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