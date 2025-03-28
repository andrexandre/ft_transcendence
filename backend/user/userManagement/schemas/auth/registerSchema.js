
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
				message: { type: 'string' },
			}
		},
		409: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', default: 409 },
				error: { type: 'string' },
			}
		},
		500: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', default: 500 },
				error: { type: 'string' },
			}
		},
	},
};

export default registerSchema;