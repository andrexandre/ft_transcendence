
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
			properties: {
				secret: { type: 'string' },
			}
		},
	},
};

const save2faSettingSchema =  {
	body: {
		type: 'object',
		properties: {
            two_FA_status: { type: 'boolean' },
			two_FA_secret: { type: 'string' },
		},
        required: [ 'two_FA_status', 'two_FA_secret' ]
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

const saveSettingsSchema = {};

export { 
	save2faSettingSchema,
	saveSettingsSchema,
	get2faSecretSchema,
	getSettingsSchema
};