import fs from 'fs';
import path from 'path';
import { uploadDirectory } from '../../utils/utils.js';
import { pipeline } from 'stream/promises';


async function userAvatarRoutes(server, opts) {
    
	server.route({
        method: 'GET',
        url: '/api/user/avatar',
        handler:  async (request, reply) => {
			
			try {
				const filePath = path.join(uploadDirectory, request.authenticatedUser.avatar);
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

	server.route({
        method: 'POST',
        url: '/api/user/update/avatar',
        handler:  async (request, reply) => {
			
			try {
				
				const data = await request.file();
				
				console.log(data.filename);
				
				// Ver como vou guardar os nomes
				const filepath = path.join(uploadDirectory, 'teste.jpeg');
				await pipeline(data.file, fs.createWriteStream(filepath));
				// Guardar o nome do ficheiro no campo avatar do user
				return;

			} catch(err) {
				console.log(err);
				reply.status(500).send({error: "Internal server error!"});
				return;
			}
        }
    });

}

export default userAvatarRoutes;
