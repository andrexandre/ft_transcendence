
export const errorResponseSchema = {
	$id: 'errorResponse',
	type: 'object',
	properties: {
		statusCode: { type: 'integer' },
		errorMessage: { type: 'string' }
	},
	required: ['statusCode', 'errorMessage']
};

class serverError extends Error {
	constructor(errorMessage, status) {
	  super(errorMessage);
	  this.status = status;
	}

	formatError() {
		return {
			statusCode: this.status,
			errorMessage: this.message
		};
	}
}

export class UserNotFoundError extends serverError {
	constructor() {
	  super("User not found!", 404);
	}
}

export class WrongPasswordError extends serverError {
	constructor() {
	  super("Wrong password!", 401);
	}
}

export class GoogleDefaulLoginError extends serverError {
	constructor() {
	  super("Can only sign with google!", 403);
	}
}