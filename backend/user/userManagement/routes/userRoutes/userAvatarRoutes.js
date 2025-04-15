import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';



async function userAvatarRoutes(server, opts) {
    
	server.route({
        method: 'GET',
        url: '/api/user/avatar',
        handler:  async (request, reply) => {
           
		try {

			// const token = request.cookies.token;
			// const response = await fetch('http://gateway-api:7000/userData', {
			// 	method: "GET",
			// 	headers: {
			// 		"Cookie": `token=${token}`,
			// 	},
			// 	credentials: "include"
			// });

			// if (!response.ok) reply.status(500).send({error: "Internal server error!"});

			// const userData = await response.json();
			// const targetUser = await server.getUserByUsername(userData.username);

			const __filename = fileURLToPath(import.meta.url);
			const __dirname = dirname(__filename);
			
			const filePath = path.join(__dirname, '../../uploads', "default.jpg");
			await fs.promises.access(filePath, fs.constants.F_OK);
			const stream = fs.createReadStream(filePath);
			const fileSize = await fs.promises.stat(filePath);
			// console.log('SIZEE: ', ));
			console.log(stream)
			reply.type('image/jpeg').send(stream);
			// reply.type('image/jpg').header('Content-Length', fileSize);	
			// reply.header('Content-Disposition', `inline; filename="default.jpg"`);
			// reply.status(200).send(stream);

		} catch(err) {
			console.log(err);
			reply.status(500).send({error: "Internal server error!"});
		}

			

			// reply.status(200).send({
			// 	username: targetUser.username,
			// 	email: targetUser.email,
			// 	codename: targetUser.codename,
			// 	biography: targetUser.biography
			// });
            
        },
    });

    

}

export default userAvatarRoutes;
