import { addFriend, addRequest, getFriends, getRequests, deleteFriendRequest, addBlock, checkBlock, deleteBlock, addInvite, isInvited, removeInvite, getLobbyId, getUserId, getUsername, removeInviteLobby } from '../database/db.js';
import { checkFriendOnline, getAllUsers, getTimeString, parseRoomName, roomName, roomNotifications } from '../utils/utils.js';
import { createMessage, createNotification, loadMessages, loadNotifications, sendMessage, storeNotifications, updateBlockRoom } from '../messages/messages.js';

export const users = new Map();
export const sockets = new Map();
export const rooms = new Map();

export async function SocketHandler(socket, username)
{
	try {
		users.set(username, socket);
		sockets.set(socket, username);
		console.log(`${username} connected`);
		
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
				// game invite in
				case 'invite-to-game': {
					const to = users.get(data.friend);
					await addInvite(username, data.friend, data.lobbyId);
					if (!to) return;
					to.send(JSON.stringify({
						type: 'receive-game-invite',
						from: data.from,
						lobbyId: data.lobbyId
					}));
					break;
				}
				case 'reject-invite':
					const targetSock = users.get(data.to);
					if (!targetSock) return;
					await removeInvite(data.to, username);
					targetSock.send(JSON.stringify({
						type: 'invite-rejected',
						from: username
					}));
					break;
				case 'join-accepted':
					const to = users.get(data.friend);
					if (!to) return;
					await removeInvite(data.friend, username);
					to.send(JSON.stringify({
						type: 'join-accepted2',
						lobbyId: data.lobbyId
					}));
					break;
				// game invite out

				case 'chat-message':
					await handleChatMessage(username, data.message, socket);
					break;
				case 'join-room':
					await joinRoom(username, data.friend, socket);
					break;
				case 'get-friends-list':
					await sendFriendList(username, socket);
					if (data.friend)
						await sendFriendList(data.friend, users.get(data.friend));
					break;
				case 'get-online-users':
					await sendOnlineUsers(username, socket);
					break;
				case 'friend-request-response':
					if (data.response === 'accept')
					{
						await addFriend(username, data.sender);
						// await sendFriendList(username, socket);
						// await sendFriendList(data.sender, users.get(data.sender));
					}
					await deleteFriendRequest(username, data.sender);
					break;
				case 'add-friend-request':
					await addRequest(username, data.receiver);
					//await sendRequests(data.receiver, users.get(data.receiver));
					//send the request to update automatically
					break;
				case 'get-friend-request':
					await sendRequests(username, socket);
					break;
				case 'block-user':
					await addBlock(username, data.friend);
					await updateBlockRoom(username, data.friend);
					socket.send(JSON.stringify({
						type: 'block-status',
						isBlocked: true,
						friend: data.friend,
						load: data.load
					}));
					break;
				case 'unblock-user':
					await deleteBlock(username, data.friend);
					socket.send(JSON.stringify({
						type: 'block-status',
						isBlocked: false,
						friend: data.friend,
						load: data.load
					}));
					break;
				case 'check-block':
					const block = await checkBlock(username, data.friend);
					const invite = await isInvited(data.friend, username);
					let lobby;
					if (invite)
						lobby = await getLobbyId(data.friend, username);
					socket.send(JSON.stringify({
						type: 'block-status',
						isBlocked: block,
						friend: data.friend,
						isInvited: invite,
						lobbyId: lobby,
						load: true
					}));
					break;
				case 'get-online-friends':
					await sendOnlineFriends(username, socket);
					break;
				case 'lobby-closed':
					removeInviteLobby(data.lobbyId);
					break;
				case 'load-notifications':
					const room_not = await roomNotifications(username);
					console.log(room_not)
					const notifications = await loadNotifications(room_not);
					console.log(notifications);
					socket.send(JSON.stringify({
						type: 'load-notifications',
						notifications: notifications
					}));
					break;
				case 'add-notification':
					const notif = createNotification(data.msg, getTimeString());
					storeNotifications(await roomNotifications(username), notif);
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
	const user_id = await getUserId(username);
	const friend_id = (users_room[0] == user_id ? users_room[1] : users_room[0]);

	const friend = await getUsername(friend_id);

	const message = await createMessage(user_id, msg, getTimeString());
	const call = await sendMessage(message, room, friend, await checkBlock(username, friend));

	socket.send(JSON.stringify({
		user: username,
		type: 'message-emit',
		data: message,
		userId: user_id
	}));
	if (call === "emit" && !(await checkBlock(friend, username)))
	{
		clients.forEach(client =>{
			if (client !== socket && client.readyState === 1)
			{
				client.send(JSON.stringify({
					user: friend,
					type: 'message-emit',
					data: message,
					userId: friend_id
				}));
			}
		});
	}
}

async function joinRoom(username, friend, socket)
{
	const room = await roomName(friend, username);

	for (const clients of rooms.values())
		clients.delete(socket);

	if (!rooms.has(room))
		rooms.set(room, new Set());
	rooms.get(room).add(socket);
	const msgHistory = await loadMessages(room, await checkBlock(username, friend));
	const user_id = await getUserId(username);
	if(msgHistory && msgHistory.length > 0)
	{
		socket.send(JSON.stringify({
			user: username,
			type: 'load-messages',
			data: msgHistory,
			userId: user_id
		}));
	}
}

async function sendFriendList(username, socket)
{
	const friends = await getFriends(username);
	socket.send(JSON.stringify({
		type: 'get-friends-list',
		data: friends
	}));
}

async function sendOnlineFriends(username, socket)
{
	const friends = await getFriends(username);
	const online_friends = await checkFriendOnline(friends);
	socket.send(JSON.stringify({
		type: 'get-online-friends',
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
	}));
}