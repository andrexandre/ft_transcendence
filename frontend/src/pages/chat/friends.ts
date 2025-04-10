import { showToast } from "../../utils";


// let socket: WebSocket | null = null

// const response = await fetch('/api/user', {
// 	method: 'GET',
// 	credentials: 'include',
// });
// try {
//     if (!response.ok) {
// 		console.error('Failed to fetch user data:', response.status, response.statusText);
//         // Handle error case
//     } else {
// 		console.log("response: " + response.ok);
//     }
// } catch (error) {
// 	console.error('Error fetching user data:', error);
//     // Handle network error
// }

const host = `ws://127.0.0.1:2000/chat-ws`;
const socket = new WebSocket(host);

socket.onopen = () => {
	showToast('Chat socket created');
}

socket.onerror = (error) => {
	showToast('WebSocket error:' + error);
};

socket.onclose = (event) => {
	console.log('WebSocket connection closed:', event.code, event.reason);
	// Maybe add some reconnection logic here
};


// socket.onmessage = (event) => {
// 	const data = JSON.parse(event.data);
// 	if (data.type === 'message-emit')
// 		addMessage(data.user, data.data.from, data.data.message, data.data.timestamp);
// 	else if (data.type === 'load-messages')
// 		data.data.forEach(msg => addMessage(data.user, msg.from, msg.message, msg.timestamp));
// 	else if (data.type === 'get-friends-list')
// 		data.data.forEach(friend => createFriendList(friend));
// 	else if (data.type === 'get-online-users')
// 		data.data.forEach(user => addOnlineUser(user));
// 	else if	(data.type === 'add-requests')
// 		showFriendRequests(data.data);
//     else if (data.type === 'block-status')
//         createRoom(data.friend, data.isBlocked);
// };

function addListEntry(list: string, name: string): void {
	const onlineFriendsList = document.getElementById(`${list}`);
	if (onlineFriendsList) {
		const friendEntry = document.createElement('div');
		friendEntry.classList.add(`${list}-entry`);
		friendEntry.textContent = name;
		onlineFriendsList.appendChild(friendEntry);
	}
}

function removeListEntry(list: string, name: string): void {
	const onlineFriendsList = document.getElementById(`${list}`);
	if (onlineFriendsList) {
		const friendEntries = onlineFriendsList.getElementsByClassName(`${list}-entry`);
		for (const entry of Array.from(friendEntries)) {
			if (entry.textContent?.trim() === name) {
				onlineFriendsList.removeChild(entry);
				break;
			}
		}
	}
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
		() => addListEntry('online-friends-list', 'Name'));
	document.getElementById('chat-box-block')?.addEventListener('click',
		() => removeListEntry('online-friends-list', 'Name'));
	document.getElementById('chat-box-invite')?.addEventListener('click',
		() => showToast.yellow('Inviting player...'));
	document.getElementById('chat-box-profile')?.addEventListener('click',
		() => showToast.green('Viewing profile...'));
	document.getElementById('chat-box-block')?.addEventListener('click',
		() => showToast.red('Blocking user...'));
}
