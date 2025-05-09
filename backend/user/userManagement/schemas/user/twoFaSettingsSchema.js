
const two_FA_settings_schema = {
	body: {
		type: 'object',
		required: [ 'two_FA_status', 'two_FA_secret' ],
		properties: {
			two_FA_status: { type: 'boolean' },
			two_FA_secret: { type: 'string' },
		}
	},
	response: {
		200: {
			type: 'object',
			properties: {
				message: { type: 'string' },
			}
		},
		500: { $ref: 'errorResponse#' }
	},
};

export default two_FA_settings_schema;