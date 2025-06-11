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
		console.log({statusCode: 500, message: "Internal server error", error: err});
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
		const extension = (user.avatar.split('.'))[1];
		
		return reply.type(`image/${extension}`).header('content-Length', fileSize).send(stream);
	} catch(err) {
		if (err.statusCode)
			reply.status(err.statusCode).send(err)
		else
			console.log({statusCode: 500, message: "Internal server error", error: err});
		return;
	}
}

async function saveAvatar(request, reply) {
	
	try {
		const data = await request.file();
		
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
			console.log('File removed:', fileToDelete);
		}

		return;
	} catch(err) {
		console.log({statusCode: 500, message: "Internal server error", error: err});
		return;
	}
}

export {
	getAvatar,
	getProfileAvatar,
	saveAvatar
};