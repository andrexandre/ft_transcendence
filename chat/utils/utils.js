import { checkFriend, getFriends, getAll } from '../database/db.js';
import { users, sockets } from '../socket/socket_handler.js';

export function roomName(user1, user2)
{
	const sortedUsers = [user1, user2].sort();

	return `${sortedUsers[0]}-${sortedUsers[1]}`;
}

export function blockRoomName(user1, user2)
{
	return `${user1}-${user2}`;
}

export function parseRoomName(roomName)
{
	const room = 'private-' + roomName;
	const usersString = room.substring(8);
	const users = usersString.split('-');

	return users;
}

export async function checkFriendOnline(friends) {
    let onlineFriends = {};

    for (const friend of friends) {
        const isOnline = users.get(friend.username) !== undefined;
        onlineFriends[friend.username] = isOnline;
    }
    return onlineFriends;
}

export async function getAllUsers(self) {
	const users = await getAll();
	const result = [];

	for (const user of users) {
		if (user.username !== self && !(await checkFriend(self, user.username))) {
			result.push(user.username);
		}
	}

	return result;
}

export async function getOnlineUsers(self)
{
	let online_users = [];

	for (const [username, _] of users)
	{
		if(username != self)
		{
			if(!(await checkFriend(self, username)))
				online_users.push(username);
		}
	}
	return online_users;
}

export function getTimeString()
{
	const d = new Date();
	return (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + 
		   (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
}