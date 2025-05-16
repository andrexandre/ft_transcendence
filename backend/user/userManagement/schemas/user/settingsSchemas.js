
const getSettingsSchema = {
	response: {
		200: {
			type: 'object',
			properties: {
				username: { type: 'string' },
				email: { type: 'string' },
				codename: { type: 'string' },
				biography: { type: 'string' },
				auth_method: { type: 'string' },
				two_FA_status: { type: 'boolean' }
			}
		},
	}
};


const get2faSecretSchema = {
	response: {
		200: {
			type: 'object',
			properties: { secret: { type: 'string' } }
		},
	},
};

const save2faSettingSchema =  {
	body: {
		type: 'object',
		properties: {
            two_FA_status: { type: 'boolean' },
			two_FA_secret: { type: 'string' }
		},
		errorMessage: {
			required: {
				two_FA_status: 'Missing two_FA_status field.',
				two_FA_secret: 'Missing two_FA_secret field.'
			},
			properties: {
				two_FA_status: 'two_FA_status must be a boolean value.',
				two_FA_secret: 'two_FA_secret must be a string..'
			},
			_: 'Invalid request body.'
		},
        required: [ 'two_FA_status', 'two_FA_secret' ]
	},
	response: {
		200: {
			type: 'object',
			properties: { message: { type: 'string' } }
		},
		500: { $ref: 'errorResponse#' }
	},
};

const saveSettingsSchema = {};

export { 
	save2faSettingSchema,
	saveSettingsSchema,
	get2faSecretSchema,
	getSettingsSchema
};