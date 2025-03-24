import { sockets, rooms } from '../socket/socket_handler.js';
// import { roomName } from '../rooms/user.js';
import * as fs from 'fs';
import * as path from 'path';
// import { Socket } from 'dgram';

export async function storeChat(room, message)
{
	const dirPath =  `./database/messages`;
	
	if(!fs.existsSync(dirPath))
		fs.mkdirSync(dirPath, {recursive: true});
	
	const filePath = path.resolve(`./database/messages/${room}.jsonl`);

	if(!fs.existsSync(filePath))
	{
		console.log(`File doesnt exist. Creating file ${filePath}`);

		fs.writeFileSync(filePath, '');
		console.log(`File created successfully.`);
	}
	fs.appendFileSync(filePath, JSON.stringify(message) + '\n');
}

export async function createMessage(from, message, timeStamp)
{
	const chat = {
		'from': from,
		'message': message,
		'timestamp': timeStamp
	};
	return chat; 
}

export async function loadMessages(room)
{
	const dirPath =  `./database/messages`;
	
	if(!fs.existsSync(dirPath))
		fs.mkdirSync(dirPath, {recursive: true});
	
	const filePath = path.resolve(`./database/messages/${room}.jsonl`);

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

export async function sendMessage(msg, room, friend)
{
	if(!rooms.has(room))
	{
		storeChat(room, from);
		return ;
	}

	// const isInRoom = (users.get(friend).rooms.has(room)) ? true : false;
	const isFriendInRoom = [...rooms.get(room)].some(socket => sockets.get(socket) === friend);

	if(isFriendInRoom)
	{
		storeChat(room, msg);
		return 'emit';
	}
	else
		storeChat(room, msg);
	return ;
}