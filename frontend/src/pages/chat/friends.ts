import { navigate, showToast, userInfo } from "../../utils";
import { renderDashboardFriend, setProfileImage } from "../dashboard";

export function turnOnChat() {
	if (!userInfo.chat_sock || userInfo.chat_sock.readyState === WebSocket.CLOSED) {
		userInfo.chat_sock = new WebSocket(`ws://${location.hostname}:2000/chat-ws`);

		userInfo.chat_sock.onopen = () => {
			// console.debug('Chat socket created');
		}

		userInfo.chat_sock.onerror = (error) => {
			console.log('WebSocket error: ', error);
		};

		userInfo.chat_sock.onclose = (event) => {
			console.debug('WebSocket connection closed:', event.code, event.reason);
			// Maybe add some reconnection logic here
		};

		userInfo.chat_sock.onmessage = (event) => {
			socketOnMessage(event);
		};
	}
	else
		showToast.red('The chat socket is already on');
}

export function turnOffChat() {
	if (userInfo.chat_sock) {
		userInfo.chat_sock.close(1000, 'User logged out');
		userInfo.chat_sock = null;
	}
	else
		showToast.red('The chat socket is already off');
}

function handleEmptyList(name: string, value?: string) {
	const listElement = document.getElementById(name)!;
	if (listElement.innerHTML == '') {
		listElement.innerHTML = /*html*/`
			<li class="item text-c-secondary">${value || 'Empty ' + name}</li>
		`;
	}
}
function socketOnMessage(event: MessageEvent<any>) {
	const data = JSON.parse(event.data);
	// console.log(data);
	if (data.type === 'message-emit') {
		if (userInfo.path.startsWith('/chat'))
			renderMessage(data.user, data.data.from, data.data.message, data.data.timestamp);
		else
			showToast(`${data.user}: ${data.data.message}`);
	}
	else if (data.type === 'load-messages')
		data.data.forEach((msg: { user: string, from: string, message: string, timestamp: string }) => renderMessage(data.user, msg.from, msg.message, msg.timestamp));
	else if (data.type === 'get-friends-list') {
		data.data.forEach((friend: { username: string }) => renderFriendList(friend.username));
		handleEmptyList('friends-list', 'No friends, sad life');
	}
	else if (data.type === 'get-online-friends') {
		Object.entries(data.data as Record<string, boolean>).forEach(([username, isOnline]) => renderDashboardFriend(username, isOnline));
		handleEmptyList('friends-list', 'No friends, sad life');
	}
	else if (data.type === 'get-online-users') {
		data.data.forEach((user: string) => renderUsersList(user));
		handleEmptyList('users-list', 'No unfriended users');
	}
	else if (data.type === 'add-requests') {
		renderFriendRequestsList(data.data);
		handleEmptyList('friend-requests-list', 'No friend requests');
	}
	else if (data.type === 'block-status')
		renderChatRoom(data.friend, data.isBlocked);
};

function renderMessage(user: string, from: string, message: string, timestamp: string) {
	const listElement = document.getElementById(`chat-box-message-list`)!;
	const entryElement = document.createElement('li');
	let alignment;
	if (user == from)
		alignment = 'justify-end ml';
	else if (user == 'system')
		alignment = 'justify-center mx';
	else
		alignment = 'justify-start mr';
	entryElement.className = `chat-box-message-entry flex ${alignment}-20`;
	entryElement.innerHTML = /*html*/`
	<div class="flex flex-col item t-dashed break-all">
		<p class="self-start pr-4 select-all">${message}</p>
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
		userInfo.chat_sock!.send(JSON.stringify({
			type: 'block-user',
			friend: name,
			load: false
		}));
	} else {
		chatHeaderBlockButton.textContent = 'Block';
		showToast.green(`User ${name} has been unblocked`);
		userInfo.chat_sock!.send(JSON.stringify({
			type: 'unblock-user',
			friend: name,
			load: false
		}));
	}
	userInfo.chat_sock!.send(JSON.stringify({
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

function renderFriendList(name: string) {
	const friendList = document.getElementById('friends-list')!;
	const roomButton = document.createElement('button');
	roomButton.className = 'item t-dashed flex p-1 items-center gap-4';
	roomButton.innerHTML = /*html*/`
		<img id="profile-image-${name}" class="size-8 rounded-4xl">
		<p>${name}</p>
	`;

	roomButton.addEventListener('click', () => {
		// Update the current friend
		currentFriend = name;

		userInfo.chat_sock!.send(JSON.stringify({
			type: 'check-block',
			friend: name
		}));

		userInfo.chat_sock!.send(JSON.stringify({
			type: 'join-room',
			friend: name
		}));
	});
	roomButton.id = `friends-list-entry-${name}`;
	friendList.appendChild(roomButton);
	setProfileImage(`profile-image-${name}`, name);
}

function renderUsersList(name: string) {
	const usersList = document.getElementById('users-list')!;
	const userButton = document.createElement('button');
	userButton.className = 'flex item t-dashed px-4';
	userButton.innerHTML = /*html*/`
		<p class="mr-auto">${name}</p>
		<div><i class="fa-solid fa-user-plus"></i></div>
	`;
	userButton.addEventListener('click', () => {
		userInfo.chat_sock!.send(JSON.stringify({
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
	usersList.appendChild(userButton);
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
		userInfo.chat_sock!.send(JSON.stringify({
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
		userInfo.chat_sock!.send(JSON.stringify({
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

function renderFriendRequestsList(requests: { sender: string }[]) {
	requests.forEach(request => {
		renderFriendRequest(request.sender);
	});
}

function renderChatRoom(name: string, isBlocked: boolean) {
	const roomList = document.getElementById('chat-box-message-list')!;
	roomList.innerHTML = '';

	const chatHeaderUsername = document.getElementById('chat-box-header-username')!;
	chatHeaderUsername.textContent = name;
	const chatHeaderBlockButton = document.getElementById('chat-box-block')!;
	chatHeaderBlockButton.textContent = isBlocked ? 'Unblock' : 'Block';

	const chatBoxProfileImage = document.getElementById('chat-box-profile') as HTMLButtonElement;
	if (chatBoxProfileImage.disabled) {
		chatBoxProfileImage.disabled = false;
		const chatBoxElements = document.querySelectorAll('#chat-box input, #chat-box button');
		chatBoxElements.forEach(element => (element as HTMLInputElement).disabled = false);
	}
	window.history.replaceState({}, '', `/chat/${name}`);
	setProfileImage("chat-box-profile-image", name);
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

function reloadLists() {
	document.getElementById('friends-list')!.innerHTML = '';
	userInfo.chat_sock!.send(JSON.stringify({
		type: 'get-friends-list'
	}));
	document.getElementById('friend-requests-list')!.innerHTML = '';
	userInfo.chat_sock!.send(JSON.stringify({
		type: 'get-friend-request'
	}));
}

let reloadInterval: number | null = null;

export function disableAutoReload() {
	if (reloadInterval !== null) {
		clearInterval(reloadInterval);
		reloadInterval = null;
	}
}

export function setChatEventListeners() {
	document.getElementById('friends-list-refresh')?.addEventListener('click',
		() => {
			document.getElementById('friends-list')!.innerHTML = '';
			userInfo.chat_sock!.send(JSON.stringify({
				type: 'get-friends-list'
			}));
		});
	document.getElementById('friend-requests-list-refresh')?.addEventListener('click',
		() => {
			document.getElementById('friend-requests-list')!.innerHTML = '';
			userInfo.chat_sock!.send(JSON.stringify({
				type: 'get-friend-request',
			}));
		});
	document.getElementById('users-list-refresh')?.addEventListener('click',
		() => {
			document.getElementById('users-list')!.innerHTML = '';
			userInfo.chat_sock!.send(JSON.stringify({
				type: 'get-online-users'
			}));
		});
	document.getElementById('chat-box-form')?.addEventListener('submit',
		(e: Event) => {
			e.preventDefault();
			const messageText = (document.getElementById('chat-box-input') as HTMLInputElement).value.trim();
			if (messageText) {
				userInfo.chat_sock!.send(JSON.stringify({
					type: 'chat-message',
					message: messageText
				}));
				(document.getElementById('chat-box-input') as HTMLInputElement).value = "";
			} else {
				showToast.yellow('Empty message');
			}
		});
	document.getElementById('chat-box-profile')?.addEventListener('click',
		() => navigate(`/profile/${document.getElementById('chat-box-header-username')!.textContent}`));
	document.getElementById('chat-box-invite')?.addEventListener('click',
		() => showToast.yellow('Inviting player...'));
	setupBlockButtonListener();

	reloadInterval = setInterval(reloadLists, 5000); // set auto reload
	setTimeout(() => {
		document.getElementById('users-list-refresh')?.click();
		reloadLists()
		setTimeout(() => {
			if (userInfo.path != '/chat' && userInfo.path != '/chat/') {
				const friendsListEntry = document.getElementById(`friends-list-entry-${userInfo.path.split('/chat/')[1]}`)
				if (!friendsListEntry) {
					showToast.red(`${userInfo.path.split('/chat/')[1]} is not an friend`);
					window.history.replaceState({}, '', `/chat`);
				}
				else
					friendsListEntry.click()
			} else if (currentFriend)
				document.getElementById(`friends-list-entry-${currentFriend}`)?.click();
			else
				(document.getElementById('chat-box-profile-image') as HTMLImageElement).src = 'https://picsum.photos/id/63/40';
		}, 100);
	}, 100);
}
