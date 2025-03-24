import { addFriend, createUser, getFriends } from '../database/db.js';
import { checkFriendOnline, getAllUsers, getTimeString, parseRoomName, roomName } from '../rooms/user.js';
import { storeChat, createMessage, loadMessages, sendMessage } from '../messages/messages.js';

export const users = new Map();
export const sockets = new Map();
export const rooms = new Map();

// export function SocketHandler(connection, req) {
// 	// io.use((socket, next) => {
// 	// 	const username = socket.handshake.query.username;

// 	// 	if (!username) {
// 	// 		console.log('Connection attempt without username - rejected');
// 	// 		return next(new Error('Authentication error - No username provided'));
// 	// 	}
// 	// 	socket.username = username;
// 	// 	next();
// 	// });

// 	io.on('connection', async (socket) => {
// 		const username = socket.handshake.query.username;
// 		if (!username) {
// 			console.log('Connection attempt without username');
// 			socket.disconnect();
// 			return;
// 		}
// 		users.set(socket.username, socket);
// 		sockets.set(socket.id, socket.username);
// 		console.log(`${sockets.get(socket.id)} connected`);
// 		//check on the begining for online friends
// 		const friends = await getFriends(sockets.get(socket.id));
// 		const online_friends = await checkFriendOnline(friends);
// 		socket.emit('get-friends-list', online_friends);


// 		socket.on('disconnect', () => {
// 			const username = sockets.get(socket.id);
// 			users.delete(username, socket);
// 			sockets.delete(socket, username);
// 			console.log(`${username} disconnected`);
// 		});

// 		socket.on('chat-message', async (msg) => {
// 			const allRooms = [...socket.rooms];
// 			const isInRoom = (allRooms.length > 1) ? true : false;
// 			if (isInRoom == true) {
// 				const room = allRooms[1];
// 				let users_room = parseRoomName(room);
// 				let friend;
// 				if (users_room[0] == sockets.get(socket.id))
// 					friend = users_room[1];
// 				else
// 					friend = users_room[0];
// 				const message = await createMessage(sockets.get(socket.id), msg, getTimeString());
// 				const call = await sendMessage(message, room, friend);
// 				socket.emit(`message-emit`, message, sockets.get(socket.id));
// 				if (call == 'emit')
// 					socket.to(room).emit(`message-emit`, message, friend);
// 			}
// 		});

// 		socket.on('join-room', async (friend) => {
// 			const allRooms = [...socket.rooms];
// 			const isInRoom = (allRooms.length > 1) ? true : false;
// 			if (isInRoom == true) {
// 				for (let i = 1; i < allRooms.length; i++)
// 					socket.leave(allRooms[i]);
// 			}
// 			const room = roomName(friend, sockets.get(socket.id));
// 			socket.join(room);
// 			const msg = await loadMessages(room);
// 			if (msg && msg.length > 0)
// 				socket.emit('load-messages', msg, sockets.get(socket.id));
// 		});

// 		socket.on('get-friends-list', async () => {
// 			const friends = await getFriends(sockets.get(socket.id));
// 			const online_friends = await checkFriendOnline(friends);
// 			socket.emit('get-friends-list', online_friends);
// 		});

// 		socket.on('get-online-users', async () => {
// 			const online_users = await getAllUsers(sockets.get(socket.id));
// 			socket.emit('get-online-users', online_users);
// 		});

// 		socket.on('add-friend', (friend) => {
// 			console.log(`Friend: ${friend}`);
// 			addFriend(sockets.get(socket.id), friend);
// 		});
// 	});
// }

export async function SocketHandler(connection, req, username)
{
	try {

		users.set(username, connection.socket);
		sockets.set(connection.socket, username);
		console.log(`${username} connected`);
	
		const friends = await getFriends(username);
		const online_friends = await checkFriendOnline(friends);
		connection.socket.send(JSON.stringify({ type: 'get-friends-list', data: online_friends }));
	
		connection.socket.on('message', async (message) => {
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
					await handleChatMessage(username, data.message, connection.socket);
					break;
				case 'join-room':
					await joinRoom(username, data.friend, connection.socket);
					break;
				case 'get-friends-list':
					await sendFriendList(username, connection.socket);
					break;
				case 'get-online-users':
					await sendOnlineUsers(username, connection.socket);
					break;
				case 'add-friend':
					await addFriend(username, data.friend);
					break;
			}
		});
		connection.socket.on('close', () =>{
			console.log(`${username} disconnected`);
			users.delete(username);
			sockets.delete(connection.socket);
	
			for (const [room, clients] of rooms.entries()) {
				if (clients.has(connection.socket)) {
					clients.delete(connection.socket);
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
            connection.socket.close();
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
	const [room, client] = userRooms;
	const users_room = parseRoomName(room);
	const friend = users_room[0] === username ? users_room[1] : users_room[0];

	const message = await createMessage(username, msg, getTimeString());
	const call = await sendMessage(message, room, friend);

	if (call === "emit")
	{
		clients.forEach(client =>{
			if (client !== socket && client.readyState === 1)
			{
				client.send(JSON.stringify({
					type: 'message-emit',
					data: message,
					sender: friend
				}));
			}
		});
	}
}

async function joinRoom(username, friend, socket)
{
	const room = roomName(friend, username);

	for (const clients of rooms.value())
		clients.delete(socket);

	if (!rooms.has(room))
		rooms.set(room, new Set());
	rooms.get(room).add(socket);
	const msgHistory = await loadMessages(room);
	if(msgHistory && msgHistory.length > 0)
	{
		socket.send(JSON.stringify({
			type: 'load-messages',
			data: msgHistory,
			sender: username
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

export function bindSocket(username) {
	user = username;
}