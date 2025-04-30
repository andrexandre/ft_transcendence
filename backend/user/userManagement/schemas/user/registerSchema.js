
const registerSchema = {
	body: {
		type: 'object',
		required: [ 'username', 'email', 'password' ],
		properties: {
			username: { type: 'string' },
			email: { type: 'string', format: 'email' },
			password: { type: 'string' },
		}
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