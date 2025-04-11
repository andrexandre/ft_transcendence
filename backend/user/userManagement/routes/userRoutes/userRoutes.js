

async function userRoutes(server, opts) {
    
    server.route({
        method: 'GET',
        url: '/api/user/info',
        handler:  async (request, reply) => {
           
			const token = request.cookies.token;
			const response = await fetch('http://gateway-api:7000/userData', {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Cookie": `token=${token}`,
				},
				credentials: "include"
			});

			if (!response.ok) reply.status(500).send({error: "Internal server error!"});

			const userData = await response.json();
			const targetUser = await server.getUserByUsername(userData.username);

			reply.status(200).send({
				username: targetUser.username,
				email: targetUser.email,
				codename: targetUser.codename,
				biography: targetUser.biography
			});
            
        },
    });
}

export default userRoutes;
