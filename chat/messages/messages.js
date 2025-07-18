import { sockets, rooms } from '../socket/socket_handler.js';
import * as fs from 'fs';
import * as path from 'path';
import { checkBlock } from '../database/db.js';
import { roomName } from '../utils/utils.js';
import { timeStamp } from 'console';

export async function storeChat(room, message, blocked)
{
	const dirPath =  `./database/messages`;
	
	if(!fs.existsSync(dirPath))
		fs.mkdirSync(dirPath, {recursive: true});
	

	let room_name;
	if(blocked)
		room_name = 'blocked-' + room;
	else
		room_name = 'private-' + room;
	const filePath = path.resolve(`${dirPath}/${room_name}.jsonl`);

	if(!fs.existsSync(filePath))
	{
		console.log(`File doesnt exist. Creating file ${filePath}`);
		if(blocked)
		{
			copyContents(room);
			return ;
		}
		fs.writeFileSync(filePath, '');
		console.log(`File created successfully.`);
	}
	if(!blocked)
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

function copyContents(room)
{
	const private_room = 'private-' + room;
	const blocked_room = 'blocked-' + room;

	const dirPath =  `database/messages`;
	
	if(!fs.existsSync(dirPath))
		fs.mkdirSync(dirPath, {recursive: true});

	const file_path_private = path.resolve(`./${dirPath}/${private_room}.jsonl`);
	const file_path_blocked = path.resolve(`./${dirPath}/${blocked_room}.jsonl`);

	if(!fs.existsSync(file_path_private))
		return [];

	const fileContent = fs.readFileSync(file_path_private, 'utf8');

	if (!fileContent.trim())
		return [];

	fs.writeFileSync(file_path_blocked, '');

	const messages = fileContent
		.split('\n')
		.filter(line => line.trim())
		.map(line => JSON.parse(line));
		
	messages.forEach(message => {
		fs.appendFileSync(file_path_blocked, JSON.stringify(message) + '\n');
	});
}

export async function loadMessages(room, blocked)
{
	const dirPath =  `./database/messages`;
	
	if(!fs.existsSync(dirPath))
		fs.mkdirSync(dirPath, {recursive: true});

	let room_name;
	if(blocked)
		room_name = 'blocked-' + room;
	else
		room_name = 'private-' + room;

	const filePath = path.resolve(`${dirPath}/${room_name}.jsonl`);

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

export async function sendMessage(msg, room, friend, blocked)
{
	if(!rooms.has(room))
	{
		storeChat(room, msg, blocked);
		return ;
	}

	const isFriendInRoom = [...rooms.get(room)].some(socket => sockets.get(socket) === friend);

	if(isFriendInRoom)
	{
		storeChat(room, msg, blocked);
		if(blocked)
			return ;
		return 'emit';
	}
	else
		storeChat(room, msg, blocked);
	return ;
}

export async function updateBlockRoom(username, friend)
{
	const block = (await checkBlock(username, friend)) && (await checkBlock(friend, username));

	if(block)
		return ;
	const room = await roomName(username, friend);
	copyContents(room);
}

export async function storeNotifications(room, message)
{
	const dirPath =  `./database/notifications`;
	
	if(!fs.existsSync(dirPath))
		fs.mkdirSync(dirPath, {recursive: true});

	const filePath = path.resolve(`${dirPath}/${room}.jsonl`);

	if(!fs.existsSync(filePath))
	{
		console.log(`File doesnt exist. Creating file ${filePath}`);
		fs.writeFileSync(filePath, '');
		console.log(`File created successfully.`);
	}
	fs.appendFileSync(filePath, JSON.stringify(message) + '\n');
}

export async function loadNotifications(room)
{
	const dirPath =  `./database/notifications`;
	
	if(!fs.existsSync(dirPath))
		fs.mkdirSync(dirPath, {recursive: true});

	const filePath = path.resolve(`${dirPath}/${room}.jsonl`);

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

export function createNotification(msg, timestamp)
{
	const not = {
		'msg': msg,
		'timeStamp': timestamp
	};
	return not
}