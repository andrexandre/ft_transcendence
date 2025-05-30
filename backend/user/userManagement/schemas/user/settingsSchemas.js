
const getSettingsSchema = {
	response: {
		200: {
			type: 'object',
			properties: {
				username: { type: 'string' },
				email: { type: 'string' },
				codename: { type: 'string' },
				biography: { type: 'string' },
				two_FA_status: { type: 'boolean' }
			}
		},
	}
};


const get2faSecretSchema = {
	params: {
		type: 'object',
		required: ['username'],
		properties: { username: { type: 'string', minLength: 3 , maxLength: 15 } },
		errorMessage: {
			required: { username: 'Missing username field.', },
			properties: { username: 'Username must be a string between 3 and 15 characters.' },
			_: 'Invalid request params.'
		},
	},
	response: {
		200: {
			type: 'object',
			properties: { secret: { type: 'string' } }
		},
	},
};

const get2faSecretStatus = {
	params: {
		type: 'object',
		required: ['username'],
		properties: { username: { type: 'string', minLength: 3 , maxLength: 15 } },
		errorMessage: {
			required: { username: 'Missing username field.', },
			properties: { username: 'Username must be a string between 3 and 15 characters.' },
			_: 'Invalid request params.'
		},
	},
	response: {
		200: {
			type: 'object',
			properties: { status: { type: 'boolean' } }
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

const saveSettingsSchema = {
	body: {
		type: 'object',
		required: [ 'username', 'codename', 'biography'],
		properties: {
			username: { type: 'string', minLength: 3, maxLength: 15, pattern: '^[a-zA-Z0-9]+$' },
			codename: { type: 'string', minLength: 5, maxLength: 30, pattern: '^[a-zA-Z ]+$' },
			biography: { type: 'string', minLength: 5, maxLength: 200 },
		},
		errorMessage: {
			required: {
				username: 'Missing username field.',
				codename: 'Missing codename field.',
				biography: 'Missing biography field.',
			},
			properties: {
				username: 'Username must be a string between 3 to 15 characters and inlude only characters and numbers.',
				codename: 'Codename must be a string between 5 to 30 characters and inlude only characters.',
				biography: 'Biography must have between 5 to 200 characters',
			},
			_: 'Invalid request body.'
		}
	}
};

export { 
	save2faSettingSchema,
	saveSettingsSchema,
	get2faSecretSchema,
	get2faSecretStatus,
	getSettingsSchema
};