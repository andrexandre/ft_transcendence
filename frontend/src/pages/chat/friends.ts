import { showToast } from "../../utils";

const host = `ws://127.0.0.1:2000/chat-ws`;
const socket = new WebSocket(host);

socket.onopen = () => {
	console.debug('Chat socket created');
}

socket.onerror = (error) => {
	showToast('WebSocket error:' + error);
};

socket.onclose = (event) => {
	console.debug('WebSocket connection closed:', event.code, event.reason);
	// Maybe add some reconnection logic here
};


socket.onmessage = (event) => {
	const data = JSON.parse(event.data);
	// console.log(data);
	if (data.type === 'message-emit')
		addMessage(data.user, data.data.from, data.data.message, data.data.timestamp);
	else if (data.type === 'load-messages')
		data.data.forEach((msg: { user: string, from: string, message: string, timestamp: string }) => addMessage(data.user, msg.from, msg.message, msg.timestamp));
	else if (data.type === 'get-friends-list')
		data.data.forEach((friend: string) => createFriendList(friend));
	else if (data.type === 'get-online-users')
		data.data.forEach((user: string) => addOnlineUser(user));
	else if	(data.type === 'add-requests')
		showFriendRequests(data.data);
	else if (data.type === 'block-status')
		createRoom(data.friend, data.isBlocked, data.load);
};

function addMessage(user: string, from: string, message: string, timestamp: string) {
	const List = document.getElementById(`chat-box-message-list`)!;
	const Entry = document.createElement('div');
	Entry.style.textAlign = user === from ? 'right' : 'left';
	Entry.classList.add(`chat-box-message-entry`);
	Entry.textContent = `${timestamp} ${from}: ${message}`;
	List.appendChild(Entry);
}

// Global variable to track the current friend
let currentFriend: string | null = null;

// This function will remain the same
function listenerA(name: string) {
    const chatHeaderBlockButton = document.getElementById('chat-box-block')!;
    const isBlocking = chatHeaderBlockButton.textContent!.includes('Block');
    if (isBlocking) {
        chatHeaderBlockButton.textContent = 'Unblock';
        showToast.red(`User ${name} has been blocked`);
        socket.send(JSON.stringify({
            type: 'block-user',
            friend: name,
            load: false
        }));
    } else {
        chatHeaderBlockButton.textContent = 'Block';
        showToast.green(`User ${name} has been unblocked`);
        socket.send(JSON.stringify({
            type: 'unblock-user',
            friend: name,
            load: false
        }));
    }
    socket.send(JSON.stringify({
        type: 'join-room',
        friend: name
    }));
}

function setupBlockButtonListener() {
    const chatHeaderBlockButton = document.getElementById('chat-box-block')!;
    
    // Remove any existing listeners by cloning the button
    const newButton = chatHeaderBlockButton.cloneNode(true);
    if (chatHeaderBlockButton.parentNode) {
        chatHeaderBlockButton.parentNode.replaceChild(newButton, chatHeaderBlockButton);
    }
    
    // Add a single listener that uses the currentFriend variable
    const updatedButton = document.getElementById('chat-box-block')!;
    updatedButton.addEventListener('click', () => {
        if (currentFriend) {
            listenerA(currentFriend);
        }
    });
}

function createFriendList(name: string) {
    const friendList = document.getElementById('online-friends-list')!;
    const roomButton = document.createElement('button');
    roomButton.appendChild(document.createTextNode(name));
    
    roomButton.addEventListener('click', () => {
        // Update the current friend
        currentFriend = name;
        
        socket.send(JSON.stringify({
            type: 'check-block',
            friend: name
        }));
        
        socket.send(JSON.stringify({
            type: 'join-room',
            friend: name
        }));
        
        showToast.blue(`Joining room with ${name}`);
    });
    
    friendList.appendChild(roomButton);
}

function addOnlineUser(name: string) { // refresh online-users-list
	const onlineUsersList = document.getElementById('online-users-list')!;
	const userButton = document.createElement('button');
	userButton.appendChild(document.createTextNode('[Add Friend] ' + name));
	userButton.addEventListener('click', () => {
		socket.send(JSON.stringify({
			type: 'add-friend-request',
			receiver: name
		}));
		showToast.blue(`Inviting ${name}...`);
		userButton.textContent = 'Request Sent to ' + name;
		userButton.style.backgroundColor = 'lightgray';
		userButton.disabled = true;
	});
	onlineUsersList.appendChild(userButton);
}

function addFriendRequest(name: string) {
	const friendRequestsList = document.getElementById('friend-requests-list')!;
	addListEntry('friend-requests-list', name);
	const friendRequestEntry = document.getElementById(`friend-requests-list-entry-${name}`)!;

	const acceptButton = document.createElement('button');
	acceptButton.textContent = '✓';
	acceptButton.addEventListener('click', () => {
		socket.send(JSON.stringify({
			type: 'friend-request-response',
			sender: name,
			response: 'accept'
		}));

		friendRequestEntry.remove();
		// removeListEntry('friend-requests-list', name);
		showToast.green(`Friend request from ${name} accepted`);
	});

	const declineButton = document.createElement('button');
	declineButton.textContent = '✗';
	declineButton.addEventListener('click', () => {
		socket.send(JSON.stringify({
			type: 'friend-request-response',
			sender: name,
			response: 'decline'
		}));

		friendRequestEntry.remove();
		// removeListEntry('friend-requests-list', name);
		showToast.red(`Friend request from ${name} declined`);
	});
	friendRequestEntry.appendChild(acceptButton);
	friendRequestEntry.appendChild(declineButton);
	friendRequestsList.appendChild(friendRequestEntry);
}

function showFriendRequests(requests: {sender: string}[]) {
	const friendRequestsList = document.getElementById('friend-requests-list')!;
	friendRequestsList.innerHTML = '';
	console.log(requests);
	requests.forEach(request => {
		addFriendRequest(request.sender);
	});
}
let isChatLoaded = false;
function createRoom(name: string, isBlocked: boolean, load: boolean) { //* load chat box
	const roomList = document.getElementById('chat-box-message-list')!;
	roomList.innerHTML = '';

	const chatHeaderUsername = document.getElementById('chat-box-header-username')!;
	chatHeaderUsername.textContent = name;
	const chatHeaderBlockButton = document.getElementById('chat-box-block')!;
	chatHeaderBlockButton.textContent = isBlocked ? 'Unblock' : 'Block';
	
	// if (load) {
	// 	chatHeaderBlockButton.addEventListener('click', () => {
	// 		const isBlocking = chatHeaderBlockButton.textContent!.includes('Block');
	// 		if (isBlocking) {
	// 			chatHeaderBlockButton.textContent = 'Unblock';
	// 			showToast.red(`User ${name} has been blocked`);
	// 			socket.send(JSON.stringify({
	// 				type: 'block-user',
	// 				friend: name,
	// 				load: false
	// 			}));
	// 		} else {
	// 			chatHeaderBlockButton.textContent = 'Block';
	// 			showToast.green(`User ${name} has been unblocked`);
	// 			socket.send(JSON.stringify({
	// 				type: 'unblock-user',
	// 				friend: name,
	// 				load: false
	// 			}));
	// 		}
	// 		socket.send(JSON.stringify({
	// 			type: 'join-room',
	// 			friend: name
	// 		}));
	// 	});
	// }
}

function addListEntry(list: string, name: string): void {
	const List = document.getElementById(`${list}`);
	if (List) {
		const Entry = document.createElement('div');
		Entry.classList.add(`${list}-entry`);
		Entry.textContent = name;
		Entry.id = `${list}-entry-${name}`;
		List.appendChild(Entry);
	}
	else //* remove after chat is stable
		showToast.red(`List ${list} not found`);
}

function removeListEntry(list: string, name: string): void {
	const List = document.getElementById(`${list}`);
	if (List) {
		const Entries = List.getElementsByClassName(`${list}-entry`);
		for (const entry of Array.from(Entries)) {
			if (entry.textContent?.trim() === name) {
				List.removeChild(entry);
				break;
			}
		}
	}
	else //* remove after chat is stable
		showToast.red(`List ${list} not found`);
}

export function setChatEventListeners() {
	document.getElementById('online-friends-refresh')?.addEventListener('click',
		() => {
			document.getElementById('online-friends-list')!.innerHTML = '';
			socket.send(JSON.stringify({
				type: 'get-friends-list'
			}));
			showToast.blue('Refreshing online friends...');
		});
	document.getElementById('friend-request-button')?.addEventListener('click',
		() => {
			socket.send(JSON.stringify({
				type: 'get-friend-request',
			}));
			showToast.blue('Checking friend requests...')	
		});
	document.getElementById('online-users-refresh')?.addEventListener('click',
		() => {
			document.getElementById('online-users-list')!.innerHTML = '';
			socket.send(JSON.stringify({
				type: 'get-online-users'
			}));
			showToast.blue('Refreshing online users...')
		});
	document.getElementById('chat-box-form')?.addEventListener('submit',
		(event) => {
			event.preventDefault();
			const messageText = (document.getElementById('chat-box-input') as HTMLInputElement).value.trim();
			if (messageText) {
				showToast.green(`Message sent: ${messageText}`);
				socket.send(JSON.stringify({
					type: 'chat-message',
					message: messageText
				}));
				(document.getElementById('chat-box-input') as HTMLInputElement).value = "";
			} else {
				showToast.yellow('Empty message');
			}
		});
	document.getElementById('chat-box-profile')?.addEventListener('click',
		() => showToast.green('Viewing profile...'));
	document.getElementById('chat-box-invite')?.addEventListener('click',
		() => showToast.yellow('Inviting player...'));
	setupBlockButtonListener();
}
