


export async function friendsRoutes1(server, opts) {
	
	server.route({
		method: 'POST',
		url: '/api/friend-request',
		schema: {},
	
		handler:  async (request, response) => {

			const { requesterUsername , requesteeUsername } = request.body;
			try {
				const requestee = await server.getUserByUsername(requesteeUsername);
				const requester = await server.getUserByUsername(requesterUsername);

				await server.createFriendRequest(requestee, requester, requestee.id);
				await server.createFriendRequest(requestee, requester, requester.id);
				
			} catch(err) {
				console.log(err);
				response.status(400).send({message: err});
			}

			response.status(200).send({message: "Request was maid sucefful"});
			// Tenho que colocar na base de dados dos dois que um pedido foi feito
				},
	});
}

export async function friendsRoutes2(server, opts) {
	
	server.route({
		method: 'POST',
		url: '/api/friend-request-accept',
		schema: {},
	
		handler:  async (request, response) => {

			const { requesterUsername , requesteeUsername } = request.body;
			try {
				const requestee = await server.getUserByUsername(requesteeUsername); 
				// nem sera preciso porque o user id ou useranem ja esta no token 
				const requester = await server.getUserByUsername(requesterUsername);

				await server.createFriendRequest(requestee, requester, requestee.id);
				await server.createFriendRequest(requestee, requester, requester.id);
				
			} catch(err) {
				console.log(err);
				response.status(400).send({message: err});
			}

			response.status(200).send({message: "Request was maid sucefful"});
			// Tenho que colocar na base de dados dos dois que um pedido foi feito
				},
	});
}

// export default friendsRoutes;