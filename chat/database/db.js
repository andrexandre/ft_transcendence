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
			user_id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT NOT NULL UNIQUE
		);
		CREATE TABLE IF NOT EXISTS tournaments (
			tournament_id INTEGER PRIMARY KEY AUTOINCREMENT,
			tournament_name TEXT NOT NULL
		);
		CREATE TABLE IF NOT EXISTS friendships (
			user_id INTEGER,
			friend_id INTEGER,
			FOREIGN KEY (user_id) REFERENCES users(user_id),
			FOREIGN KEY (friend_id) REFERENCES users(user_id),
			PRIMARY KEY (user_id, friend_id),
			CHECK (user_id != friend_id)
		);
		CREATE TABLE IF NOT EXISTS tournament_participants (
			tournament_id INTEGER,
			user_id INTEGER,
			FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id),
			FOREIGN KEY (user_id) REFERENCES users(user_id),
			PRIMARY KEY (tournament_id, user_id)
		);
		CREATE TABLE IF NOT EXISTS users_blocked (
			user_id INTEGER,
			blocked_user INTEGER,
			FOREIGN KEY (user_id) REFERENCES users(user_id),
			FOREIGN KEY (blocked_user) REFERENCES users(user_id)
		);
	`);
	console.log("Database created!");

	return db;
}

export async function createUser(username)
{
	const user = await db.get('SELECT username FROM users WHERE username = ?', [username]);

	if(user)
	{	
		console.log(`Logged in ${username}`);
		return ;
	}
	await db.run(`
		INSERT INTO users (username)
		VALUES ($username);
	`, {
		$username: username
	});
	console.log(`User created succesfully ${username}`);
}

export async function addFriend(username, friend_username)
{
	const user = await db.get('SELECT user_id FROM users WHERE username = ?', [username]);
	const friend = await db.get('SELECT user_id FROM users WHERE username = ?', [friend_username]);

	if(!user || !friend) {
		throw new Error('User doesnt exist');
	}
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
		throw new Error('Failed to add frienship: ' + error.message);
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
