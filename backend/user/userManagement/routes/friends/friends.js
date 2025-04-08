


export function friendRequestRoute(server, opts) {
	
	server.route({
		method: 'POST',
		url: '/api/friend-request',
		schema: {},
	
		handler:  async (request, response) => {

			const { requesterUsername , requesteeUsername } = request.body;
			try {
				const requestee = await server.getUserByUsername(requesteeUsername);
				const requester = await server.getUserByUsername(requesterUsername);
				
				// Tenho que colocar na base de dados dos dois que um pedido foi feito
				// Change to onle make this once
				await server.createFriendRequest(requestee, requester, requestee.id);
				await server.createFriendRequest(requestee, requester, requester.id);
				
			} catch(err) {
				console.log(err);
				response.status(400).send({message: err});
			}

			response.status(200).send({message: "Request was maid sucefful"});
			},
	});
}

export async function processFriendRequestRoute(server, opts) {
	
	server.route({
		method: 'POST',
		url: '/api/friend-request-accept',
		schema: {},
	
		handler:  async (request, response) => {

			const { requesterUsername , requesteeUsername } = request.body;
			try {
				// nem sera preciso porque o user id ou useranem ja esta no token 
				const requestee = await server.getUserByUsername(requesteeUsername); 
				const requester = await server.getUserByUsername(requesterUsername);

				await server.acceptFriendRequest(requestee, requester, requestee.id);
				// await server.acceptFriendRequest(requestee, requester, requester.id);
				
			} catch(err) {
				console.log(err);
				response.status(400).send({message: err});
			}

			response.status(200).send({message: "Request reach to the final"});
			// Tenho que colocar na base de dados dos dois que um pedido foi feito
				},
	});
}
