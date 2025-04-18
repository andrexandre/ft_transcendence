import fs from 'fs';
import path from 'path';
import { __dirname } from '../../utils/utils.js';


async function userAvatarRoutes(server, opts) {
    
	server.route({
        method: 'GET',
        url: '/api/user/avatar',
        handler:  async (request, reply) => {
           
		try {
			
			const filePath = path.join(__dirname, '../uploads', request.authenticatedUser.avatar);
			await fs.promises.access(filePath, fs.constants.F_OK);
			const stream = fs.createReadStream(filePath);
			
			const fileSize = (await fs.promises.stat(filePath)).size;
			console.log('SIZEE: ', fileSize);

			// tipo dependendo da extensao
			return reply.type('image/jpeg').header('content-Length', fileSize).send(stream);

		} catch(err) {
			console.log(err);
			reply.status(500).send({error: "Internal server error!"});
			return;
		}

        }
    });

}

export default userAvatarRoutes;
