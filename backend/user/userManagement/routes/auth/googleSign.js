

async function googleSignRoutes(server, opts) {
	
	server.route({
		method: 'POST',
		url: '/api/login/googleSign',
		schema: {
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
		},
	
		handler:  async (request, response) => {
			
			const { username, email, auth_method } = request.body;
			let resContent;
			try {
				
				let user = await server.getUserByUsername(username);
				if (!user) {
					// criar o user
					await server.createUser(username, email, null, auth_method);
					user = await server.getUserByUsername(username);
					resContent = {
						userID: `${user.id}`,
						username: `${user.username}`,
						message: "User created"
					};
					response.status(201).send(resContent);
				} 
				
				resContent = {
					userID: `${user.id}`,
					username: `${user.username}`,
					message: "User already exist"
				};
				response.status(200).send(resContent);
				
			} catch(err) {
				if (err.code === 'SQLITE_CONSTRAINT') {
					const msg = (err.message.includes("email")) ? 'Email' : 'Username'; // true
					response.status(409).send({message: `${msg} already exist!`});
				} else {
					response.status(500).send({message: `${err}`});
				} 
			}

		},
	});
}

export default googleSignRoutes;