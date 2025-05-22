
const registerSchema = {
	body: {
		type: 'object',
		properties: {
			username: { type: 'string', minLength: 3, maxLength: 15, pattern: '^[a-zA-Z0-9]+$' },
			email: { type: 'string', format: 'email', maxLength: 255, },
			password: {
				type: 'string',
				minLength: 3,
				// pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).+$', // descomentar depois
			},
		},
		errorMessage: {
			required: {
				username: 'Missing username field.',
				email: 'Missing email field.',
				password: 'Missing password field.'
			},
			properties: {
				username: 'Username must be a string between 3 to 15 characters and inlude only characters and numbers.',
				email: 'Invalid email format or length.',
				password: 'Password must be at least 8 characters and include uppercase, lowercase, number and special character.'
			},
			_: 'Invalid request body.'
		},
		required: [ 'username', 'email', 'password' ]
	},
	response: {
		201: {
			type: 'object',
			properties: {
				statusCode: { type: 'number' },
				message: { type: 'string' },
			}
		},
		409: { $ref: 'errorResponse#' },
		500: { $ref: 'errorResponse#' },
	},
};

export default registerSchema;