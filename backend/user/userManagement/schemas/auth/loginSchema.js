
const loginSchema = {
	body: {
		type: 'object',
		properties: {
			username: { type: 'string', minLength: 3 , maxLength: 15 },
			password: { type: 'string', minLength: 3 },
		},
		errorMessage: {
			required: {
				username: 'Missing username field.',
				password: 'Missing password field.'
			},
			properties: {
				username: 'Username must be a string between 3 and 15 characters.',
				password: 'Password must be at least 8 characters'
			},
			_: 'Invalid request body.'
		},
		required: [ 'username', 'password' ]
	},
	response: {
		200: {
			type: 'object',
			properties: { two_FA_status: { type: 'boolean' } }
		},
		401: { $ref: 'errorResponse#' },
		403: { $ref: 'errorResponse#' },
		404: { $ref: 'errorResponse#' },
		500: { $ref: 'errorResponse#' },
	},
};

export default loginSchema;