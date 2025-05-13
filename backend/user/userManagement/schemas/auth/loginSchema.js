
const loginSchema = {
	body: {
		type: 'object',
		required: [ 'username', 'password' ],
		properties: {
			username: { type: 'string' },
			password: { type: 'string' },
		}
	},
	response: {
		200: {
			type: 'object',
			properties: {
				userID: { type: 'string' },
				username: { type: 'string' },
			}
		},
		// 401: { $ref: 'errorResponse#' },
		// 403: { $ref: 'errorResponse#' },
		// 404: { $ref: 'errorResponse#' },
	},
};

export default loginSchema;