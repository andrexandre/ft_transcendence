import { users,sockets } from '../socket/socket_handler.js';
import { roomName } from '../rooms/user.js';
import * as fs from 'fs';
import * as path from 'path';

export async function storeChat(user, friend, message)
{
	const dirPath =  `/var/livechat/users/${user}`;
	
	if(!fs.existsSync(dirPath))
		fs.mkdirSync(dirPath, {recursive: true});
	
	const filePath = path.resolve(`/var/livechat/users/${user}/${friend}.jsonl`);

	if(!fs.existsSync(filePath))
	{
		console.log(`File doesnt exist. Creating file ${filePath}`);

		fs.writeFileSync(filePath, '');
		console.log(`File created successfully.`);
	}
	fs.appendFileFileSync(filePath, JSON.stringify(message) + '\n');
}

export async function createMessage(from, message, timeStamp)
{
	return chat = {
		'from': from,
		'message': message,
		'timestamp': timeStamp
	};
}

export async function loadMessages(user, friend)
{
	const dirPath =  `/var/livechat/users/${user}`;
	
	if(!fs.existsSync(dirPath))
		fs.mkdirSync(dirPath, {recursive: true});
	
	const filePath = path.resolve(`/var/livechat/users/${user}/${friend}.jsonl`);

	if(!fs.existsSync(filePath))
		return [];

	const fileContent = fs.readFileSync(filePath, 'utf8');

	if (!fileContent.trim())
		return [];
	  
	const messages = fileContent
		.split('\n')
		.filter(line => line.trim())
		.map(line => JSON.parse(line));

	return messages;
}