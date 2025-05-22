import bcrypt from 'bcrypt'

async function register(request, reply) {
	
	const { username, email, password } = request.body;
	try {
		
		// Password hashing
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		await this.createUser(username, email, hashedPassword, 'email');

		// Create the user in game db
		const user = await this.getUserByUsername(username);
		const response = await fetch('http://nginx-gateway:80/game/init-user', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({id: user.id, username: user.username})
		});

		if (!response.ok) {
			console.log('User not created in game!');
			console.log('Error creating user in game: ', (await response.json()));
		}

		reply.status(201).send({
			statusCode: 201,
			message: `Successfully registred ${username}!`
		});

	} catch(err) {
		if (err.code === 'SQLITE_CONSTRAINT') {
            const msg = (err.message.includes("email")) ? 'Email' : 'Username';
            reply.status(409).send({statusCode: 409, error: "Conflict", message: `${msg} already exists!`});
        } else {
            reply.status(500).send({statusCode: 500, error: "Internal server error", message: 'Error in creating user!'});
        } 
	}
}

export { register };