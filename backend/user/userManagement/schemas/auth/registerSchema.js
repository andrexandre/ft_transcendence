
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
	},
};

export default registerSchema;