import fs from 'fs';
import path from 'path';
import { __dirname } from '../../utils/utils.js';


async function userAvatarRoutes(server, opts) {
    
	server.route({
        method: 'GET',
        url: '/api/user/avatar',
        handler:  async (request, reply) => {
           
		try {

			const token = request.cookies.token;
			const response = await fetch('http://gateway-api:7000/userData', {
				method: "GET",
				headers: {
					"Cookie": `token=${token}`,
				},
				credentials: "include"
			});

			if (!response.ok) reply.status(500).send({error: "Internal server error!"});

			const userData = await response.json();
			const targetUser = await server.getUserByUsername(userData.username);

			
			const filePath = path.join(__dirname, '../uploads', targetUser.avatar);
			await fs.promises.access(filePath, fs.constants.F_OK);
			const stream = fs.createReadStream(filePath);
			
			const fileSize = (await fs.promises.stat(filePath)).size;
			console.log('SIZEE: ', fileSize);
			
			return reply
			.type('image/jpeg') // tipo dependendo da extensao 
			.header('content-Length', fileSize)
			.send(stream);

		} catch(err) {
			console.log(err);
			reply.status(500).send({error: "Internal server error!"});
		}

        },
    });

}

export default userAvatarRoutes;
