// Files
import fs from 'fs';
import path from 'path';
import { unlink } from 'fs/promises';
import { pipeline } from 'stream/promises';
import { uploadDirectory } from '../../utils/utils.js';
// Random id
import { randomUUID } from 'crypto'


async function getAvatar(request, reply) {
	
	try {
		const filePath = path.join(uploadDirectory, request.authenticatedUser.avatar);
		await fs.promises.access(filePath, fs.constants.F_OK);

		const stream = fs.createReadStream(filePath);
		const fileSize = (await fs.promises.stat(filePath)).size;
		
		// tipo dependendo da extensao
		return reply.type('image/jpeg').header('content-Length', fileSize).send(stream);
	} catch(err) {
		reply.status(500).send({statusCode: 500, error: "Internal server error", message: 'Failed to load Avatar!'});
		return;
	}
}

async function getProfileAvatar (request, reply) {
	
	try {
		const { username } = request.params;

		const user = await this.getUserByUsername(username);
		if (!user)
			throw this.httpErrors.notFound('User not found!');

		const filePath = path.join(uploadDirectory, user.avatar);
		await fs.promises.access(filePath, fs.constants.F_OK);

		const stream = fs.createReadStream(filePath);
		const fileSize = (await fs.promises.stat(filePath)).size;
		
		// tipo dependendo da extensao
		return reply.type('image/jpeg').header('content-Length', fileSize).send(stream);
	} catch(err) {
		(err.statusCode) ? 
        reply.status(err.statusCode).send(err) : reply.status(500).send({statusCode: 500, error: "Internal server error", message: 'Failed to load Avatar!'});
		return;
	}
}

async function saveAvatar(request, reply) {
	
	try {
		const data = await request.file();
	
		console.log('FIELDNAME: ', data.fieldname);
		console.log('FILENAME: ', data.filename);
		console.log('ENDCONDING: ', data.encoding);
		console.log('TYPE: ', data.mimetype);

		// Creating avatar filename
		const extension = (data.mimetype.split('/'))[1];
		const name = `${randomUUID()}.${extension}`;
		
		// Creating the avatar with a random id and saving the new path
		const filepath = path.join(uploadDirectory, name);
		await pipeline(data.file, fs.createWriteStream(filepath));
		await this.updateUserAvatar(name, request.authenticatedUser.id);
		
		// Delete old avatar
		if (request.authenticatedUser.avatar !== 'default.jpeg') {
			const fileToDelete = path.join(uploadDirectory, request.authenticatedUser.avatar);
			await unlink(fileToDelete);
			console.log('Ficheiro removido:', fileToDelete);
		}

		return;
	} catch(err) {
		reply.status(500).send({statusCode: 500, error: "Internal server error", message: 'Error saving new avatar!'});
		return;
	}
}

export {
	getAvatar,
	getProfileAvatar,
	saveAvatar
};