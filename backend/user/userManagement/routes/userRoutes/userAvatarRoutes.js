import fs from 'fs';
import path from 'path';
import { uploadDirectory } from '../../utils/utils.js';
import { pipeline } from 'stream/promises';
import crypto from 'crypto'


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
			
				// console.log(data);
				// console.log(data.fieldname);
				// console.log(data.filename);
				// console.log(data.encoding);
				// console.log(data.mimetype);
				
				// data.file.on('limit', () => {
				// 	console.log('Limite de tamanho de arquivo atingido.');
				// 	reply.status(400).send({ error: 'Arquivo muito grande' });
				//   });
				
				// // Processamento do arquivo (se não atingir o limite)
				// data.file.on('data', (chunk) => {
				// console.log(`Recebendo chunk de ${chunk.length} bytes`);
				// });
			
				// data.file.on('end', () => {
				// console.log('Upload concluído.');
				// });
			
				// data.file.on('error', (err) => {
				// console.error('Erro ao processar o arquivo:', err);
				// reply.status(500).send({ error: 'Erro ao processar o arquivo' });
				// });


				const extension = (data.mimetype.split('/'))[1];
				const name = `${crypto.randomUUID()}.${extension}`;
				
				// Saving images with a random id
				const filepath = path.join(uploadDirectory, name);
				await pipeline(data.file, fs.createWriteStream(filepath));
				// Guardar o nome do ficheiro no campo avatar do user
				await server.updateUserAvatar(name, request.authenticatedUser.id);
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
