import bcrypt from 'bcrypt'
import registerSchema from '../../schemas/auth/registerSchema.js';

async function register(request, response) {
	
	const { username, email, password } = request.body;
	try {
		
		// Password hashing
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		console.log(this);
		await this.createUser(username, email, hashedPassword, 'email');
		console.log('AQUIIIIIIIIIIIIII');
		response.status(201).send({
			statusCode: 201,
			message: `Successfully created user ${username}`
		});

	} catch(err) {
		if (err.code === 'SQLITE_CONSTRAINT') {
			const msg = (err.message.includes("email")) ? 'Email' : 'Username';
			response.status(409).send({
				statusCode: 409,
				errorMessage: `${msg} already exist!`
			});
		} else {
			response.status(500).send({statusCode: 500, errorMessage: `Internel server error`});
		}
		
	}
}

export default register;