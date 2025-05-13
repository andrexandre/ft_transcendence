
const profileSchema = {
	params: {
			type: 'object',
			required: ['username'],
			properties: {
				username: { type: 'string', minLength: 1 }
			}
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