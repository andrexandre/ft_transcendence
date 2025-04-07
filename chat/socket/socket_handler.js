import { addFriend, addRequest, getFriends, getRequests, deleteFriendRequest, addBlock, checkBlock } from '../database/db.js';
import { checkFriendOnline, getAllUsers, getTimeString, parseRoomName, roomName } from '../utils/utils.js';
import { createMessage, loadMessages, sendMessage } from '../messages/messages.js';

export const users = new Map();
export const sockets = new Map();
export const rooms = new Map();

export async function SocketHandler(socket, username)
{
	try {
		users.set(username, socket);
		sockets.set(socket, username);
		console.log(`${username} connected`);
	
		const friends = await getFriends(username);
		const online_friends = await checkFriendOnline(friends);
		socket.send(JSON.stringify({ type: 'get-friends-list', data: online_friends }));
	
		socket.on('message', async (message) => {
			let data;
			try {
				data = JSON.parse(message);
			}
			catch (error) {
				console.error('Invalid message format: ' + message);
				return;
			}
			switch (data.type){
				case 'chat-message':
					await handleChatMessage(username, data.message, socket);
					break;
				case 'join-room':
					await joinRoom(username, data.friend, socket);
					break;
				case 'get-friends-list':
					await sendFriendList(username, socket);
					console.log(data.friend)
					if (data.friend)
						await sendFriendList(data.friend, users.get(data.friend));
					break;
				case 'get-online-users':
					await sendOnlineUsers(username, socket);
					break;
				case 'friend-request-response':
					if (data.response === 'accept')
						await addFriend(username, data.sender);
					await deleteFriendRequest(username, data.sender);
					break;
				case 'add-friend-request':
					await addRequest(username, data.receiver);
					break;
				case 'get-friend-request':
					await sendRequests(username, socket);
					break;
				case 'block-user':
					await addBlock(username, data.friend);
					break;
				case 'check-block':
					const block = await checkBlock(username, data.friend);
					socket.send(JSON.stringify({
						type: 'block-status',
						isBlocked: block,
						friend: data.friend
					}));
					break;
			}
		});
		socket.on('close', () =>{
			console.log(`${username} disconnected`);
			users.delete(username);
			sockets.delete(socket);
	
			for (const [room, clients] of rooms.entries()) {
				if (clients.has(socket)) {
					clients.delete(socket);
					if(clients.size === 0)
						rooms.delete(room);
				}
			}
		});
	}
	catch (error) {
		console.error(`Error handling socket for ${username}:`, error);
		// Maybe try to close the connection cleanly
		try {
			socket.close();
		} catch (e) {
			console.error('Error closing socket:', e);
		}
	}
}

async function handleChatMessage(username, msg, socket)
{
	const userRooms = [...rooms.entries()].find(([_, clients]) => clients.has(socket));
	if (!userRooms)
		return ;
	const [room, clients] = userRooms;
	const users_room = parseRoomName(room);
	const friend = users_room[0] === username ? users_room[1] : users_room[0];

	
	const message = await createMessage(username, msg, getTimeString());
	const call = await sendMessage(message, room, friend, await checkBlock(username, friend));

	socket.send(JSON.stringify({
		user: username,
		type: 'message-emit',
		data: message
	}));
	if (call === "emit" && !(await checkBlock(friend, username)))
	{
		clients.forEach(client =>{
			if (client !== socket && client.readyState === 1)
			{
				client.send(JSON.stringify({
					user: friend,
					type: 'message-emit',
					data: message
				}));
			}
		});
	}
}

async function joinRoom(username, friend, socket)
{
	const room = roomName(friend, username);

	for (const clients of rooms.values())
		clients.delete(socket);

	if (!rooms.has(room))
		rooms.set(room, new Set());
	rooms.get(room).add(socket);
	const msgHistory = await loadMessages(room, await checkBlock(username, friend));
	if(msgHistory && msgHistory.length > 0)
	{
		socket.send(JSON.stringify({
			user: username,
			type: 'load-messages',
			data: msgHistory,
			// sender: username
		}));
	}
}

async function sendFriendList(username, socket)
{
	const friends = await getFriends(username);
	const online_friends = await checkFriendOnline(friends);
	socket.send(JSON.stringify({
		type: 'get-friends-list',
		data: online_friends
	}));
}

async function sendOnlineUsers(username, socket)
{
	const online_users = await getAllUsers(username);
	socket.send(JSON.stringify({
		type: 'get-online-users',
		data: online_users
	}));
}

async function sendRequests(receiver, socket)
{
	const requests = await getRequests(receiver)

	socket.send(JSON.stringify({
		type: 'add-requests',
		data: requests
	}))
}