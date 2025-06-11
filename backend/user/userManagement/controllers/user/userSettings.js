import setCookie from 'set-cookie-parser';

function getSettings(request, reply) {
           
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
		// Update information
		await this.updateUserInformation(request.body, request.authenticatedUser.id);

		const { username } =  request.body;
		if (request.authenticatedUser.username !== username) {
			const responseJwt = await fetch('https://nginx-gateway:80/token/updateToken', {
				method: 'POST',
				headers: {
					"Content-Type": "application/json",
					"Cookie": `token=${request.cookies.token}`,
				},
				body: JSON.stringify({ username: username })
			});

			if (!responseJwt.ok) {
				// Changing user information to before;
				await this.updateUserInformation(request.authenticatedUser, request.authenticatedUser.id);
				throw new Error('Bad jwt!');
			}
			
			const CookieHeaderContent = responseJwt.headers.get('set-cookie');
			const cookieOpts = (setCookie(CookieHeaderContent))[0];

			const newValue = cookieOpts.value;
			delete cookieOpts.name;
			delete cookieOpts.value;

			const responseGame = await fetch('https://nginx-gateway:80/game/updateUserInfo', {
				method: 'POST',
				headers: { "Cookie": `token=${newValue}` },
			});

			if (!responseGame.ok) {
				// Changing user information to before;
				await this.updateUserInformation(request.authenticatedUser, request.authenticatedUser.id);
				throw new Error('Bad Game');
			}
			
			reply.setCookie('token', newValue, cookieOpts);
		}

		reply.status(200).send({message: "Successfully update the information!"});

	} catch (err) {
		if (err.code === 'SQLITE_CONSTRAINT') {
            const msg = (err.message.includes("email")) ? 'Email' : 'Username';
            reply.status(409).send({statusCode: 409, error: "Conflict", message: `${msg} already exist!`});
        } else {
            console.log({statusCode: 500, message: "Internal server error", error: err});
        } 
	}
	return; 
}

async function save2faSettings(request, reply) {

	try {
		
		await this.updateUser2FAStatus(request.body, request.authenticatedUser.id);
		reply.status(200).send({message: "Successfully updated 2FA!"});

	} catch (err) {
		// dataBase errors
		console.log({statusCode: 500, message: "Internal server error", error: err});
		return;
	}

}

async function get2faSecret(request, reply) {

	const { username } = request.params
	try {
		const user = await this.getUserByUsername(username);
		if (!user) throw this.httpErrors.notFound('User not found!');
		
		reply.status(200).send({
			secret: user.two_FA_secret
		});
	} catch (err) {
		if (err.statusCode)
			reply.status(err.statusCode).send(err);
		else
			console.log({statusCode: 500, message: "Internal server error", error: err});
        return;
	}
}

async function get2faStatus(request, reply) {

	const { username } = request.params;
	try {
		const user = await this.getUserByUsername(username);
		if (!user) throw this.httpErrors.notFound('User not found!');
			
		return reply.status(200).send({
			status: user.two_FA_status
		});
	} catch (err) {
		if (err.statusCode)
			reply.status(err.statusCode).send(err);
		else
			console.log({statusCode: 500, message: "Internal server error", error: err});
        return;
	}
}

export {
	getSettings,
	get2faStatus,
	get2faSecret,
	saveSettings,
	save2faSettings
};