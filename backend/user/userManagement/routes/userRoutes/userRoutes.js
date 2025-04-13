

async function userRoutes(server, opts) {
    
    server.route({
        method: 'GET',
        url: '/api/user/info',
        handler:  async (request, reply) => {
           
			//aqui provavlemente vai ter de ser multipart/form-data
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

	 
    server.route({
        method: 'POST',
        url: '/api/users/update',
        handler:  async (request, reply) => {

			// const data = request.parts();
			// for await (const part of data) 
			// {
			// 	if (part.file) {
			// 	  // ficheiro: part.file é um stream
			// 	  console.log(`Ficheiro: ${part.filename}`);
			// 	  part.file.resume();
			// 	} else {
			// 	  // campo de texto
			// 	  console.log('ALEXXXXXXXXXXXX');
			// 	  if (part.fieldname === 'user') {
			// 		const json = JSON.parse(part.value);
			// 		console.log(json);
			// 	  }

			// 	}
				
			//   }


			// console.log('FIMMMMMMMMMMMMMMMMMMMM');


			// reply.status(200).send({message: 'END OF REQUEST'});
		}}
	);

}

export default userRoutes;
