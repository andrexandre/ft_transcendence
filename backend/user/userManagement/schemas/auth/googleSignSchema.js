
const googleSignSchema = {
	body: {
		type: 'object',
		required: [ 'username', 'email', 'auth_method' ],
		properties: {
			username: { type: 'string' },
			email: { type: 'string', format: 'email' },
			auth_method: { type: 'string' }
		}
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
	},
};

export default googleSignSchema;