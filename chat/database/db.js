import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const dbPath = './database/chat.db';
const db = await open({
	filename: dbPath,
	driver: sqlite3.Database
});

export async function initializeDatabase()
{
	await db.exec(`
		CREATE TABLE IF NOT EXISTS users (
			user_id INTEGER UNIQUE,
			username TEXT NOT NULL UNIQUE
		);
		CREATE TABLE IF NOT EXISTS friendships (
			user_id INTEGER,
			friend_id INTEGER,
			FOREIGN KEY (user_id) REFERENCES users(user_id),
			FOREIGN KEY (friend_id) REFERENCES users(user_id),
			PRIMARY KEY (user_id, friend_id),
			CHECK (user_id != friend_id)
		);
		CREATE TABLE IF NOT EXISTS users_blocked (
			user_id INTEGER,
			blocked_user INTEGER,
			PRIMARY KEY (user_id, blocked_user),
			FOREIGN KEY (user_id) REFERENCES users(user_id),
			FOREIGN KEY (blocked_user) REFERENCES users(user_id)
			CHECK (user_id != blocked_user)
		);
		CREATE TABLE IF NOT EXISTS friend_requests (
			request_id INTEGER PRIMARY KEY AUTOINCREMENT,
			sender_id INTEGER,
			receiver_id INTEGER,
			sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (sender_id) REFERENCES users(user_id),
			FOREIGN KEY (receiver_id) REFERENCES users(user_id),
			CHECK (sender_id != receiver_id)
		);
		CREATE TABLE IF NOT EXISTS invites (
			user_id INTEGER,
			invited_user INTEGER,
			lobby_id TEXT NOT NULL UNIQUE,
			PRIMARY KEY (user_id, invited_user)
			FOREIGN KEY (user_id) REFERENCES users(user_id),
			FOREIGN KEY (invited_user) REFERENCES users(user_id),
			CHECK (user_id != invited_user)
		);
	`);
	console.log("Database created!");

	return db;
}

export async function addInvite(username, invited, lobbyId)
{
	const user_id = await db.get('SELECT user_id FROM users WHERE username = ?', [username]);
	const invited_id = await db.get('SELECT user_id FROM users WHERE username = ?', [invited]);

	if(!user_id || !invited_id)
		throw new Error('User doesnt exist');

	const invite = await db.get(`
		SELECT * from invites
		WHERE (user_id = ? AND invited_user = ?)
		`, [user_id.user_id, invited_id.user_id])

	if(!invite)
	{
		await db.run(`
			INSERT INTO invites (user_id, invited_user, lobby_id)
			VALUES (?, ?, ?)
			`, [user_id.user_id,  invited_id.user_id, lobbyId])
	}
}

export async function removeInvite(username, invited)
{
	const user_id = await db.get('SELECT user_id FROM users WHERE username = ?', [username]);
	const invited_id = await db.get('SELECT user_id FROM users WHERE username = ?', [invited]);

	if (!user_id || !invited_id)
		throw new Error('User not found');

	await db.run(`
		DELETE FROM invites
		WHERE user_id = ? AND invited_user = ?
	`, [user_id.user_id, invited_id.user_id]);
}

export async function removeInviteLobby(lobby)
{
	try{
		await db.run(`
		DELETE FROM invites
		WHERE lobby_id = ?
		`, [lobby]);
	}
	catch (error)
	{
		throw new Error('Failed to remove lobby: ', error);
	}
}

export async function isInvited(username, invited)
{
	try{

		const user_id = await db.get('SELECT user_id FROM users WHERE username = ?', [username]);
		const invited_id = await db.get('SELECT user_id FROM users WHERE username = ?', [invited]);
	
		if(!user_id || !invited_id)
			throw new Error('User doesnt exist');
	
		const invite = await db.get(`
			SELECT * from invites
			WHERE (user_id = ? AND invited_user = ?)
			`, [user_id.user_id, invited_id.user_id])
		
		return invite ? true : false;		
	}
	catch(error)
	{
		console.log("Error: " + error);
	}
}

export async function getLobbyId(username, invited)
{
	const user_id = await db.get('SELECT user_id FROM users WHERE username = ?', [username]);
	const invited_id = await db.get('SELECT user_id FROM users WHERE username = ?', [invited]);

	if(!user_id || !invited_id)
		throw new Error('User doesnt exist');

	const invite = await db.get(`
		SELECT * from invites
		WHERE (user_id = ? AND invited_user = ?)
		`, [user_id.user_id, invited_id.user_id])
	
	if (!invite)
		throw new Error('No invite found between users');	
	return invite.lobby_id;
}

export async function getAll()
{
	const users = await db.all('SELECT * from users');
	return users;
}

export async function getUserId(username)
{
	try
	{
		const user = await db.get('SELECT user_id FROM users WHERE username = ?', [username]);
	
		if(!user)
			throw new Error('User doesnt exist');
		return user.user_id;
	}
	catch (error)
	{
		console.log('Error: ' + error);
	}
}

export async function getUsername(id)
{
	const user = await db.get('SELECT username FROM users WHERE user_id = ?', [id]);

	if(!user)
		throw new Error('User doesnt exist');

	return user.username;
}

async function checkUsername(username, current_username, id)
{
	if(username !== current_username)
	{
		await db.run(`
			UPDATE users
			SET username = ?
			WHERE user_id = ?
		`, [current_username, id]);
		console.log('Updated username on database');
	}
}

export async function createUser(username, id)
{
	const user = await db.get('SELECT username FROM users WHERE user_id = ?', [id]);

	if(user)
	{	
		await checkUsername(user.username, username, id);
		console.log(`Logged in ${username}`);
		return ;
	}
	await db.run(`
		INSERT INTO users (user_id, username)
		VALUES (?, ?);
	`,[id, username]);
	console.log(`User created succesfully ${username}`);
}

export async function addFriend(username, friend_username)
{
	const user = await db.get('SELECT user_id FROM users WHERE username = ?', [username]);
	const friend = await db.get('SELECT user_id FROM users WHERE username = ?', [friend_username]);

	if(!user || !friend) {
		throw new Error('User doesnt exist');
	}
	const frienship = await db.get(`
		SELECT * FROM friendships
		WHERE (user_id = ? AND friend_id = ?)
		`, [user.user_id, friend.user_id]);

	if(frienship)
		return ;
	try {
		await db.run(`
			INSERT INTO friendships (user_id, friend_id)
			VALUES (?, ?);
		`,[user.user_id, friend.user_id]);
		await db.run(`
			INSERT INTO friendships (user_id, friend_id)
			VALUES (?, ?);
		`,[friend.user_id, user.user_id]);
	}
	catch (error) {
		throw new Error('Failed to add friendship: ' + error.message);
	}
}

export async function getFriends(username)
{
	try {
		const user = await db.get(`SELECT user_id FROM users WHERE username = ?`, [username]);
	
		const query = `
            SELECT u.username
            FROM users u
            INNER JOIN friendships f ON u.user_id = f.friend_id
            WHERE f.user_id = ?
        `;
		const friends = await db.all(query, [user.user_id]);
		
		return friends;
	}
	catch (error){
		console.error('Error getting friends: ', error);
		return [];
	}
}

export async function checkFriend (username, friend_username)
{
	const user = await db.get(`SELECT user_id FROM users WHERE username = ?`, [username]);

	const friend = await db.get(`SELECT user_id FROM users WHERE username = ?`, [friend_username]);

	if(!user || !friend)
		return false;

	const friendship = await db.get(`
		SELECT * from friendships
		WHERE (user_id = ? AND friend_id = ?)
		`, [user.user_id, friend.user_id]);

	return friendship;
}

export async function addRequest(sender, receiver)
{
	const sender_id = await db.get(`SELECT user_id FROM users WHERE username = ?`, [sender])
	const receiver_id = await db.get(`SELECT user_id FROM users WHERE username = ?`, [receiver])

	const request = await db.get(`
		SELECT * from friend_requests
		WHERE (sender_id = ? AND receiver_id = ?)
		`, [sender_id.user_id, receiver_id.user_id])

	if(!request)
	{
		await db.run(`
		INSERT INTO friend_requests (sender_id, receiver_id)
		VALUES (?, ?)
		`, [sender_id.user_id, receiver_id.user_id])
	}
}

export async function getRequests(receiver)
{
	try {
		const receiver_id = await db.get(`SELECT user_id FROM users WHERE username = ?`, [receiver])

		const requests = await db.all(`
            SELECT 
                fr.request_id,
                u.username AS sender, 
                fr.sent_at
            FROM 
                friend_requests fr
            JOIN 
                users u ON fr.sender_id = u.user_id
            WHERE 
                fr.receiver_id = ? 
            ORDER BY fr.sent_at DESC
        `, [receiver_id.user_id]);

        return requests;
	}
	catch(error)
	{
		console.error('Error getting friend requests: ', error)
		return [];
	}
}

export async function deleteFriendRequest(receiver, sender)
{
	try {
        const sender_id = await db.get(`SELECT user_id FROM users WHERE username = ?`, [sender]);
        const receiver_id = await db.get(`SELECT user_id FROM users WHERE username = ?`, [receiver]);
        
        if (!sender_id || !receiver_id) {
            console.error('User not found');
            return false;
        }
        
        await db.run(`
            DELETE FROM friend_requests 
            WHERE sender_id = ? AND receiver_id = ?
        `, [sender_id.user_id, receiver_id.user_id]);
        
        return true;
    } catch (error) {
        console.error('Error deleting friend request:', error);
        return false;
    }
}

export async function addBlock(user, friend)
{
	try {
		const user_id = await db.get(`SELECT user_id FROM users WHERE username = ?`, [user]);
		const friend_id = await db.get(`SELECT user_id FROM users WHERE username = ?`, [friend]);

		await db.run(`
			INSERT INTO users_blocked (user_id, blocked_user)
			VALUES (?, ?)
		`, [user_id.user_id, friend_id.user_id]);
	}
	catch (error) {
		console.error('Error adding blocked user: ', error);
		return ;
	}
}

export async function deleteBlock(user, friend)
{
	try {
		const user_id = await db.get(`SELECT user_id FROM users WHERE username = ?`, [user]);
		const friend_id = await db.get(`SELECT user_id FROM users WHERE username = ?`, [friend]);

		if (!user_id || !friend_id) {
            console.error('User or friend not found');
            return;
        }

		await db.run(`
			DELETE FROM users_blocked
			WHERE user_id = ? AND blocked_user = ?
			`, [user_id.user_id, friend_id.user_id]);
	}
	catch (error) {
		console.error('Error deleting user from users_blocked table: ' + error);
		return ;
	}
}

export async function checkBlock(username, friend)
{
	try {
		const user_id = await db.get(`SELECT user_id FROM users WHERE username = ?`, [username]);
		const friend_id = await db.get(`SELECT user_id FROM users WHERE username = ?`, [friend]);
		const blocked = await db.get(`
			SELECT * FROM users_blocked
			WHERE (user_id = ? AND blocked_user = ?)
			`, [user_id.user_id, friend_id.user_id]);
		if (!blocked)
			return false;
		return true;
	}
	catch (error) {
		console.error('Error checking block: ', error);
		return ;
	}
}