import bcrypt from 'bcrypt'

async function register(request, response) {
	
	const { username, email, password } = request.body;
	try {
		
		// Password hashing
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		await this.createUser(username, email, hashedPassword, 'email');
		response.status(201).send({
			statusCode: 201,
			message: `Successfully created user ${username}`
		});

	} catch(err) {
		if (err.code === 'SQLITE_CONSTRAINT') {
            const msg = (err.message.includes("email")) ? 'Email' : 'Username';
            response.status(409).send({statusCode: 409, error: "Conflict", message: `${msg} already exist!`});
        } else {
            response.status(500).send({statusCode: 500, error: "Internal server error", message: 'Error in creating user!'});
        } 
	}
}

export { register };