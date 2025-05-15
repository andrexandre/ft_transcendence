
const registerSchema = {
	body: {
		type: 'object',
		properties: {
			username: { type: 'string', minLength: 3 , maxLength: 15 },
			email: { type: 'string', format: 'email', maxLength: 255,},
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
				username: 'Username must be a string between 3 and 15 characters.',
				email: 'Invalid email format or length.',
				password: 'Password must be at least 8 characters and include uppercase, lowercase, number and special character.'
			},
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