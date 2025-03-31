
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
	},
};

export default loginSchema;