import { addFriend, createUser, getFriends } from '../database/db.js';
import { checkFriendOnline, getAllUsers, roomName } from '../rooms/user.js';
import { storeChat, createMessage, loadMessages } from '../messages/messages.js';

export const users = new Map();
export const sockets = new Map();
let user;

export function SocketHandler(io) {
	io.on('connection', (socket) =>{
		users.set(user, socket.id);
		sockets.set(socket.id, user);
		console.log(`${sockets.get(socket.id)} connected`);

		socket.on('disconnect', () =>{
			const username = sockets.get(socket.id);
			users.delete(username, socket);
			sockets.set(socket.id, username);
			console.log(`${username} disconnected`);
		});
	
		socket.on('chat-message', (msg, room) => {
			//check if he and his friend are in the room if not send the message to the friend to his computer but don't load it on his screen, only store it
			if(socket.rooms.has('new_room'))
				io.to('new_room').emit('chat-message', msg); //send message to everyone. io.broadcast.emit send message to everyone except sender
		});
	
		socket.on('join-room', (friend) =>{
			const nameRoom = roomName(socket.get(socket.id), friend);
			socket.join(nameRoom);
		});

		socket.on('get-friends-list', async () =>{
			const friends = await getFriends(sockets.get(socket.id));
			const online_friends = await checkFriendOnline(friends);
			socket.emit('get-friends-list', online_friends);
		});

		socket.on('get-online-users', async () =>{
			const online_users = await getAllUsers(sockets.get(socket.id));
			socket.emit('get-online-users', online_users);
		});
		
		socket.on('add-friend', (friend) =>{
			console.log(`Friend: ${friend}`);
			addFriend(sockets.get(socket.id), friend);
		});

		socket.on('load-messages', (friend) =>{
			const content = loadMessages(sockets(socket.id), friend);
			socket.emit('load-messages', content, sockets(socket.id));
		});
	});
}

export function bindSocket(username)
{
	user = username;
}