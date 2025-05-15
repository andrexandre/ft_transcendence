
const googleSignSchema = {
	body: {
		type: 'object',
		properties: {
			username: { type: 'string', minLength: 3 , maxLength: 15 },
			email: { type: 'string', format: 'email', maxLength: 255,},
			auth_method: { type: 'string', enum: ["google"] }
		},
		required: [ 'username', 'email', 'auth_method' ]
	},
	response: {
		200: {
			type: 'object',
			properties: {
				userID: { type: 'string' },
				username: { type: 'string' },
				message: { type: 'string' }
			}
		},
		201: {
			type: 'object',
			properties: {
				userID: { type: 'string' },
				username: { type: 'string' },
				message: { type: 'string' }
			}
		},
		409: { $ref: 'errorResponse#' },
		500: { $ref: 'errorResponse#' },
	},
};

export default googleSignSchema;