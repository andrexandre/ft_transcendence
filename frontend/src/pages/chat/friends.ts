import { showToast } from "../../utils";

const host = `ws://${location.hostname}:2000/chat-ws`;
const socket = new WebSocket(host);

socket.onopen = () => {
	console.debug('Chat socket created');
}

socket.onerror = (error) => {
	console.log('WebSocket error: ', error);
};

socket.onclose = (event) => {
	console.debug('WebSocket connection closed:', event.code, event.reason);
	// Maybe add some reconnection logic here
};


socket.onmessage = (event) => {
	const data = JSON.parse(event.data);
	// console.log(data);
	if (data.type === 'message-emit')
		renderMessage(data.user, data.data.from, data.data.message, data.data.timestamp);
	else if (data.type === 'load-messages')
		data.data.forEach((msg: { user: string, from: string, message: string, timestamp: string }) => renderMessage(data.user, msg.from, msg.message, msg.timestamp));
	else if (data.type === 'get-friends-list')
		data.data.forEach((friend: string) => renderOnlineFriendList(friend));
	else if (data.type === 'get-online-users')
		data.data.forEach((user: string) => renderOnlineUsersList(user));
	else if	(data.type === 'add-requests')
		renderFriendRequestsList(data.data);
	else if (data.type === 'block-status')
		renderChatRoom(data.friend, data.isBlocked, data.load);
};

function renderMessage(user: string, from: string, message: string, timestamp: string) {
	const listElement = document.getElementById(`chat-box-message-list`)!;
	const entryElement = document.createElement('li');
	let alignment;
	if (user == from)
		alignment = 'justify-end';
	else if (user == 'system')
		alignment = 'justify-center';
	else
		alignment = 'justify-start';
	entryElement.className = `chat-box-message-entry flex ${alignment}`;
	entryElement.innerHTML = /*html*/`
	<div class="flex flex-col item t-dashed break-all">
		<p class="self-start pr-4">${message}</p>
		<p class="self-end text-c-primary pl-4">${timestamp}</p>		
	</div>
	`;
	listElement.appendChild(entryElement);
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

function renderOnlineFriendList(name: string) {
    const friendList = document.getElementById('online-friends-list')!;
	const roomButton = document.createElement('button');
	roomButton.className = 'item t-dashed';
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

function renderOnlineUsersList(name: string) {
	const onlineUsersList = document.getElementById('online-users-list')!;
	const userButton = document.createElement('button');
	userButton.className = 'flex item t-dashed px-4';
	userButton.innerHTML = /*html*/`
		<p class="mr-auto">${name}</p>
		<div><i class="fa-solid fa-user-plus"></i></div>
	`;
	userButton.addEventListener('click', () => {
		socket.send(JSON.stringify({
			type: 'add-friend-request',
			receiver: name
		}));
		showToast.blue(`Inviting ${name}...`);
			userButton.innerHTML = /*html*/`
			<p class="mr-auto">${name}</p>
			<div><i class="fa-solid fa-user-check text-c-secondary"></i></div>
		`;
		userButton.style.pointerEvents = 'none';
		userButton.disabled = true;
	});
	onlineUsersList.appendChild(userButton);
}

function renderFriendRequest(name: string) {
	const friendRequestsList = document.getElementById('friend-requests-list')!;
	addListEntry('friend-requests-list', name, /*html*/`
			<p class="mr-auto">${name}</p>
			<button id="friend-requests-list-entry-${name}-accept">
				<i class="fa-solid fa-check"></i>
			</button>
			<button id="friend-requests-list-entry-${name}-reject">
				<i class="fa-solid fa-xmark"></i>
			</button>
		`);
	const friendRequestEntry = document.getElementById(`friend-requests-list-entry-${name}`)!;

	const acceptButton = document.getElementById(`friend-requests-list-entry-${name}-accept`)!;
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

	const declineButton = document.getElementById(`friend-requests-list-entry-${name}-reject`)!
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
	friendRequestsList.appendChild(friendRequestEntry);
}

function renderFriendRequestsList(requests: {sender: string}[]) {
	const friendRequestsList = document.getElementById('friend-requests-list')!;
	friendRequestsList.innerHTML = '';
	console.log(requests);
	requests.forEach(request => {
		renderFriendRequest(request.sender);
	});
}
let isChatLoaded = false;
//! needs to fix load variable
function renderChatRoom(name: string, isBlocked: boolean, _load: boolean) { //* load chat box
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

function addListEntry(listName: string, name: string, html: string, classes?: string) {
	const listElement = document.getElementById(`${listName}`)!;
	const entryElement = document.createElement('li');
	entryElement.className = classes || 'flex item t-dashed gap-4 justify-around px-4';
	entryElement.innerHTML = html;
	entryElement.id = `${listName}-entry-${name}`;
	listElement.appendChild(entryElement);
}

function removeListEntry(list: string, name: string) {
	const entry = document.getElementById(`${list}-entry-${name}`)!;
	document.removeChild(entry);
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
		(e: Event) => {
			e.preventDefault();
			const messageText = (document.getElementById('chat-box-input') as HTMLInputElement).value.trim();
			if (messageText) {
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
