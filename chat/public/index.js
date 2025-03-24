/* const { ItemAssignmentContextImpl } = require("twilio/lib/rest/numbers/v2/regulatoryCompliance/bundle/itemAssignment");
const { SupportingDocumentContextImpl } = require("twilio/lib/rest/trusthub/v1/supportingDocument"); */
// import Fastify from 'fastify';
// import fastifyWebsocket from '@fastify/websocket';

// const fastify = Fastify();
// fastify.register(fastifyWebsocket);

const form = document.getElementById('form');
const input = document.getElementById('input');
const roomButton = document.getElementById('roomButton');
const refreshButton = document.getElementById('refresh-button');

//Handle connections

const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('user');

const host = `ws://localhost:2000/chat-ws?user=${username}`;
const socket = new WebSocket(host);

socket.onopen = () => {
	console.log('Connected to Fastify WebSocket');
}

socket.onerror = (error) => {
	console.error('WebSocket error:', error);
};

socket.onclose = (event) => {
	console.log('WebSocket connection closed:', event.code, event.reason);
	// Maybe add some reconnection logic here
};

socket.onmessage = (event) => {
	const data = JSON.parse(event.data);
	if (data.type === 'message-emit')
		addMessage(data.data.from, data.data.message, data.data.timestamp);
	else if (data.type === 'load-messages')
		data.data.forEach(msg => addMessage(msg.from, msg.message, msg.timestamp));
	else if (data.type === 'get-friends-list')
		data.data.forEach(friend => createFriendList(friend));
	else if (data.type === 'get-online-users')
		data.data.forEach(user => addOnlineUser(user));
};

//Send messages

form.addEventListener('submit', (e) =>{
	e.preventDefault();

	if(input.value)
	{
		socket.send(JSON.stringify({
			type: 'chat-message',
			message: input.value
		}));
		input.value = '';
	}
});

/* socket.on('chat-message', (msg) =>{
	const item = document.createElement('li');
	item.textContent = msg;
	messages.appendChild(item);
	window.scrollTo(0, document.body.scrollHeight);
}); */

// socket.on('message-emit', (msg, user) =>{
// 	const { from, message, timestamp } = msg;
// 	addMessage(user, from, message, timestamp);
// });


//Handle messages

function addMessage(user, from, message, timestamp)
{
	const item = document.createElement('li');
	item.className = `message ${user == from ? 'sent' : 'received'}`;
	
	const bubble = document.createElement('div');
	bubble.className = 'message-bubble';
	
	const textElement = document.createElement('div');
	textElement.className = 'message-text';
	textElement.textContent = message;
	
	const time = document.createElement('div');
	time.className = 'message-time';
	time.textContent = timestamp;
	
	bubble.appendChild(textElement);
	bubble.appendChild(time);
	item.appendChild(bubble);

	const messages = document.getElementById('messages');
	if(messages)
		messages.appendChild(item);
	
	const messagesContainer = document.getElementById('messages-container');
	if (messagesContainer)
		messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// socket.on('load-messages', (content, user) =>{
	
// 	content.forEach(msg => {
// 		const { from, message, timestamp } = msg;
// 		addMessage(user, from, message, timestamp);
// 	});
// });

//Handle online users

function createFriendList (friendName)
{
	const friendList = document.getElementById('friendList');

	const roomButton = document.createElement('button');
	roomButton.className = 'friend-room';

	const statusDot = document.createElement('span');
	statusDot.className = 'online-status';

	const nameText = document.createTextNode(friendName);

	roomButton.appendChild(statusDot);
	roomButton.appendChild(nameText);

	roomButton.addEventListener('click', ()=> {
		
		const divFriend = document.getElementById('currentFriend');
		if(divFriend)
			divFriend.innerHTML = '';

		const onlineStatus = document.createElement('span');
		onlineStatus.className = 'online-status'; 
		const currentFriend = document.createElement('span');
		currentFriend.className = 'friend-name';
		currentFriend.textContent = friendName;

		divFriend.appendChild(onlineStatus);
		divFriend.appendChild(currentFriend);

		clearChatContainer();
		socket.send(JSON.stringify({
			type: 'join-room',
			friend: friendName
		}));
		// socket.emit('join-room', friendName);
	});

	friendList.appendChild(roomButton);
}

function clearChatContainer()
{
	const messages = document.getElementById('messages');
	if (messages)
		messages.innerHTML = '';
}

refreshButton.addEventListener('click', () =>{
	const friendList = document.getElementById('friendList');
	friendList.innerHTML = '';
	socket.send(JSON.stringify({
		type: 'get-friends-list'
	}));
	// socket.emit('get-friends-list');
});

// socket.on('get-friends-list', (friends) =>{
// 	friends.forEach(friend => createFriendList(friend));
// });

function addOnlineUser (user)
{
	const userList = document.querySelector('.online-users-list');
	
	const li = document.createElement('li');
	li.className = 'online-user-item';
	
	const userInfo = document.createElement('div');
	userInfo.className = 'user-info';
	
	const status = document.createElement('span');
	status.className = 'online-status';
	
	const nameSpan = document.createElement('span');
	nameSpan.textContent = user;
	
	const addButton = document.createElement('button');
	addButton.className = 'add-friend-btn';
	addButton.textContent = 'Add Friend';

	addButton.addEventListener('click', () =>{
		console.log(`Friend added: ${nameSpan.textContent}`);

		addButton.textContent = 'Friend Added';
		addButton.disabled = true;
		socket.send(JSON.stringify({
			type: 'add-friend',
			friend: nameSpan.textContent
		}));
		// socket.emit('add-friend', nameSpan.textContent);
	});
	
	userInfo.appendChild(status);
	userInfo.appendChild(nameSpan);
	li.appendChild(userInfo);
	li.appendChild(addButton);
	
	userList.appendChild(li);
}

document.querySelector('.online-users-toggle').addEventListener('click', () =>{
	console.log('Toggle clicked');
	const userList = document.querySelector('.online-users-list');
	userList.innerHTML = '';

	document.querySelector('.online-users-bar').classList.toggle('active');
	socket.send(JSON.stringify({
		type: 'get-online-users'
	}));
	// socket.emit('get-online-users');
});

// socket.on('get-online-users', (users) =>{
// 	users.forEach(user => addOnlineUser(user));
// });

document.querySelector('.close-bar').addEventListener('click', () =>{
	document.querySelector('.online-users-bar').classList.remove('active');
});

function setupFriendRequestsScroll() {
	const friendRequestsList = document.getElementById('friendRequestsList');
	
	if (friendRequestsList) {
	  // Enable mouse wheel scrolling
	  friendRequestsList.addEventListener('wheel', function(event) {
		// Prevent the scroll from affecting the whole page
		if (this.scrollHeight > this.clientHeight) {
		  event.preventDefault();
		  
		  // Adjust scroll amount based on wheel delta
		  const scrollAmount = event.deltaY;
		  this.scrollTop += scrollAmount;
		}
	  }, { passive: false });
	}
}