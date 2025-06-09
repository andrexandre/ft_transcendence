import { navigate, showToast, userInfo } from "../../utils";
import { renderDashboardFriend, renderProfileImage } from "../dashboard";

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
		};

		userInfo.chat_sock.onmessage = (event) => {
			socketOnMessage(event);
		};
	}
	else
		showToast.red('The chat socket is already opened');
}

export function turnOffChat() {
	if (userInfo.chat_sock) {
		if (userInfo.chat_sock.readyState === WebSocket.OPEN)
		{
			userInfo.chat_sock.close();
			userInfo.chat_sock = null;
		}
		else
			showToast.red('The chat socket exists but is closed');
	} else {
		console.log('The chat socket was null when closed');
	}
	currentFriend = null;
}

function handleEmptyList(name: string, value?: string) {
	const listElement = document.getElementById(name)!;
	if (listElement.innerHTML == '') {
		listElement.innerHTML = /*html*/`
			<li id="empty-list-${name}" class="item text-c-secondary">${value || 'Empty ' + name}</li>
		`;
	}
}
function socketOnMessage(event: MessageEvent<any>) {
	const data = JSON.parse(event.data);
	// console.log(data);
	if (data.type === 'message-emit') {
		if(userInfo.path.startsWith('/chat/'))
		{
			renderMessage(data.userId, data.data.from, data.data.message, data.data.timestamp);
			const messageList = document.getElementById('chat-box-message-list')!;
			messageList.scrollTop = messageList.scrollHeight;
		}
	}
	else if (data.type === 'load-messages') {
		data.data.forEach((msg: { user: string, from: string, message: string, timestamp: string }) => renderMessage(data.userId, msg.from, msg.message, msg.timestamp));
		const messageList = document.getElementById('chat-box-message-list')!;
		messageList.scrollTop = messageList.scrollHeight;
	}
	else if (data.type === 'get-friends-list') {
		data.data.forEach((friend: { username: string }) => renderFriendList(friend.username));
		handleEmptyList('friends-list', 'No friends, sad life');
	}
	else if (data.type === 'get-online-friends') { // render friends in dashboard not just online friends
		Object.entries(data.data as Record<string, boolean>).forEach(([username, isOnline]) => renderDashboardFriend(username, isOnline));
		handleEmptyList('friends-list', 'No friends, sad life');
	}
	else if (data.type === 'get-online-users') { // render all users not just online users
		data.data.forEach((user: string) => renderUsersList(user));
		handleEmptyList('users-list', 'No unfriended users');
	}
	else if (data.type === 'add-requests') {
		data.data.forEach((request: { sender: string }) => renderFriendRequest(request.sender));
		handleEmptyList('friend-requests-list', 'No friend requests');
	}
	else if (data.type === 'block-status')
		renderChatRoom(data.friend, data.isBlocked, data.isInvited, data.lobbyId, data.friend);
	else if (data.type === 'load-notifications') {
		data.notifications.forEach((notification: { msg: string, timeStamp: string }) => renderGameNotification(notification.msg, notification.timeStamp));
		handleEmptyList('game-notifications-list', 'No game notifications');
	}
	// game start
	else if (data.type === 'receive-game-invite') {
		showToast.green(`🎮 Convite de ${data.from}`);
		if(userInfo.path.startsWith('/chat'))
			renderGameInviteButtons(data.from, data.lobbyId);
	} else if (data.type === 'join-accepted2') {
		showToast.green("✅ O teu amigo aceitou o convite. A iniciar jogo...");
		navigate("/game");
		setTimeout(() => {
			userInfo.game_sock!.send(JSON.stringify({
				type: 'start-game',
				lobbyId: data.lobbyId,
				requesterId: userInfo.userId
			}));
		}, 100);
	}
	else if (data.type === 'invite-rejected') {
		document.getElementById("chat-box-invite-button")?.classList.remove("hidden");
		showToast.red(`❌ ${data.from} rejeitou o convite`);
	}
	// game OUT
};

function renderGameNotification(message: string, timestamp: string) {
	const listElement = document.getElementById(`game-notifications-list`)!;
	const entryElement = document.createElement('li');
	entryElement.className = `flex`;
	entryElement.innerHTML = /*html*/`
	<div class="flex flex-col flex-1 item t-dashed break-all">
		<p class="self-start pr-4 select-all">${message}</p>
		<p class="self-end text-c-primary pl-4">${timestamp}</p>		
	</div>
	`;
	listElement.appendChild(entryElement);
}

function renderGameInviteButtons(from: string, lobbyId: string) {
	document.getElementById("chat-box-invite-button")?.classList.add("hidden");
	const acceptBtn = document.getElementById("accept-invite-to-game-button")!;
	const rejectBtn = document.getElementById("reject-invite-to-game-button")!;

	acceptBtn.classList.remove("hidden");
	rejectBtn.classList.remove("hidden");

	acceptBtn.onclick = () => {
		userInfo.game_sock!.send(JSON.stringify({
			type: 'join-lobby',
			lobbyId: lobbyId
		}));
		userInfo.chat_sock!.send(JSON.stringify({
			type: 'join-accepted',
			lobbyId: lobbyId,
			requesterId: userInfo.userId,
			friend: currentFriend
		}));
		navigate("/game");
		hideInviteButtons();
	};

	rejectBtn.onclick = () => {
		userInfo.chat_sock!.send(JSON.stringify({
			type: 'reject-invite',
			to: from
		}));
		hideInviteButtons();
	};

	function hideInviteButtons() {
		acceptBtn.classList.add("hidden");
		rejectBtn.classList.add("hidden");
		document.getElementById("chat-box-invite-button")?.classList.remove("hidden");
	}
}

function renderMessage(user: string, from: string, message: string, timestamp: string) {
	const listElement = document.getElementById(`chat-box-message-list`)!;
	const entryElement = document.createElement('li');
	let alignment;
	if (user == from)
		alignment = 'justify-end ml-20';
	else if (user == 'system-notifications')
		alignment = 'justify-center mx-20';
	else
		alignment = 'justify-start mr-20';
	entryElement.className = `flex ${alignment}`;
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
	const chatHeaderBlockButton = document.getElementById('chat-box-block-button')!;
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

function renderFriendList(name: string) {
	//* caching
	// if (document.getElementById(`profile-image-${name}`))
	// 	return;
	// if (document.getElementById(`empty-list-friends-list`))
	// 	document.getElementById(`friends-list`)!.innerHTML = '';
	const friendList = document.getElementById('friends-list')!;
	const roomButton = document.createElement('button');
	roomButton.className = 'item t-dashed flex p-1 items-center gap-4';
	roomButton.innerHTML = /*html*/`
		<img id="profile-image-${name}" class="size-8 object-cover rounded-4xl">
		<p>${name}</p>
	`;

	roomButton.addEventListener('click', () => {
		// Update the current friend
		currentFriend = name;

		userInfo.chat_sock!.send(JSON.stringify({
			type: 'check-block',
			friend: name
		}));

		// userInfo.chat_sock!.send(JSON.stringify({
		// 	type: 'join-room',
		// 	friend: name
		// }));
	});
	roomButton.id = `friends-list-entry-${name}`;
	friendList.appendChild(roomButton);
	renderProfileImage(`profile-image-${name}`, name);
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
		userButton.disabled = true;
	}, { once: true });
	usersList.appendChild(userButton);
}

function addListEntry(listName: string, name: string, html: string, classes?: string) {
	const listElement = document.getElementById(`${listName}`)!;
	const entryElement = document.createElement('li');
	entryElement.className = classes || 'flex item t-dashed gap-4 justify-around px-4';
	entryElement.innerHTML = html;
	entryElement.id = `${listName}-entry-${name}`;
	listElement.appendChild(entryElement);
}

function renderFriendRequest(name: string) {
	//* caching
	// if (document.getElementById(`friend-request-${name}`))
	// 	return;
	// if (document.getElementById(`empty-list-friend-requests-list`))
	// 	document.getElementById(`friend-requests-list`)!.innerHTML = '';
	const friendRequestsList = document.getElementById('friend-requests-list')!;
	addListEntry('friend-requests-list', name, /*html*/`
		<p id="friend-request-${name}" class="mr-auto">${name}</p>
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
		handleEmptyList('friend-requests-list', 'No friend requests');
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
		handleEmptyList('friend-requests-list', 'No friend requests');
		showToast.red(`Friend request from ${name} declined`);
	});
	friendRequestsList.appendChild(friendRequestEntry);
}

function renderChatRoom(name: string, isBlocked: boolean, isInvited: boolean, lobbyId: string, from: string) {
	const roomList = document.getElementById('chat-box-message-list')!;
	roomList.innerHTML = '';

	const chatHeaderUsername = document.getElementById('chat-box-header-username')!;
	chatHeaderUsername.textContent = name;
	const chatHeaderBlockButton = document.getElementById('chat-box-block-button')!;
	chatHeaderBlockButton.textContent = isBlocked ? 'Unblock' : 'Block';

	if (isInvited)
		renderGameInviteButtons(from, lobbyId);
	else {
		document.getElementById("accept-invite-to-game-button")!.classList.add('hidden');
		document.getElementById("reject-invite-to-game-button")!.classList.add('hidden');
	}

	(document.getElementById('chat-box-input') as HTMLInputElement).disabled = isBlocked;
	(document.getElementById('chat-box-send-button') as HTMLButtonElement).disabled = isBlocked;
	if ((document.getElementById('chat-box-profile') as HTMLButtonElement).disabled) {
		const chatBoxElements = document.querySelectorAll('#chat-box input, #chat-box button');
		chatBoxElements.forEach(element => (element as HTMLInputElement).disabled = false);
	}
	window.history.replaceState({}, '', `/chat/${name}`);
	renderProfileImage("chat-box-profile-image", name);
	userInfo.chat_sock!.send(JSON.stringify({
		type: 'join-room',
		friend: name
	}));
}

function reloadLists() {
	document.getElementById('friends-list')!.innerHTML = "";
	userInfo.chat_sock!.send(JSON.stringify({
		type: 'get-friends-list'
	}));
	document.getElementById('friend-requests-list')!.innerHTML = "";
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
	handleEmptyList('game-notifications-list', 'No game requests');
	document.getElementById('game-notifications-list-refresh')?.addEventListener('click',
		() => {
			if (document.getElementById('game-notifications-list')?.classList.contains('hidden')) {
				document.getElementById('game-notifications-list')!.innerHTML = '';
				userInfo.chat_sock!.send(JSON.stringify({
					type: 'load-notifications'
				}));
			}
			document.getElementById('game-notifications-list')?.classList.toggle('hidden');
			document.getElementById('game-notifications-list')?.classList.toggle('flex');
			document.getElementById('game-notifications-container')?.classList.toggle('h-1/3');
			document.getElementById('game-notifications-container')?.classList.toggle('h-fit');
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

	// chat --- game invite
	document.getElementById('chat-box-invite-button')?.addEventListener('click', async function () {
		this.classList.add('hidden');
		showToast.yellow('Inviting player...');
		userInfo.game_sock!.send(JSON.stringify({
			type: 'create-lobby',
			gameMode: "1V1",
			maxPlayers: 2
		}));
		userInfo.pendingInviteTo = currentFriend;
	});
	document.getElementById('chat-box-block-button')!.addEventListener('click', () => {
		if (currentFriend)
			listenerA(currentFriend);
	});

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
