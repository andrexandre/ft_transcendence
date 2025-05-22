
const profileSchema = {
	params: {
		type: 'object',
		required: ['username'],
		properties: { username: { type: 'string', minLength: 3 , maxLength: 15 } },
		errorMessage: {
			required: { username: 'Missing username field.', },
			properties: { username: 'Username must be a string between 3 and 15 characters.' },
			_: 'Invalid request body.'
		},
	},
	response: {
		200: {
			type: 'object',
			properties: {
				username: { type: 'string' },
				email: { type: 'string' },
				codename: { type: 'string' },
				biography: { type: 'string' }
			}
		},
		404: { $ref: 'errorResponse#' },
		500: { $ref: 'errorResponse#' },
	}	
};

export { profileSchema };