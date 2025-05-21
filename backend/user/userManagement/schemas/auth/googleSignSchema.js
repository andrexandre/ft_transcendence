
const googleSignSchema = {
	body: {
		type: 'object',
		properties: {
			username: { type: 'string', minLength: 3 , maxLength: 15 },
			email: { type: 'string', format: 'email', maxLength: 255,},
			auth_method: { type: 'string', enum: ["google"] }
		},
		errorMessage: {
			required: {
				username: 'Missing username field.',
				email: 'Missing email field.',
				auth_method: 'Missing auth_method field.'
			},
			properties: {
				username: 'username must be a string between 3 and 15 characters.',
				email: 'Invalid email format or length.',
				auth_method: 'auth_method must be a string.'
			},
			_: 'Invalid request body.'
		},
		required: [ 'username', 'email', 'auth_method' ]
	},
	response: {
		200: {
			type: 'object',
			properties: {
				userId: { type: 'string' },
				username: { type: 'string' },
			}
		},
		201: {
			type: 'object',
			properties: {
				userId: { type: 'string' },
				username: { type: 'string' },
			}
		},
		409: { $ref: 'errorResponse#' },
		500: { $ref: 'errorResponse#' },
	},
};

export default googleSignSchema;