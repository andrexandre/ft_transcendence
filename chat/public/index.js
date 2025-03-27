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
		addMessage(data.user, data.data.from, data.data.message, data.data.timestamp);
	else if (data.type === 'load-messages')
		data.data.forEach(msg => addMessage(data.user, msg.from, msg.message, msg.timestamp));
	else if (data.type === 'get-friends-list')
		data.data.forEach(friend => createFriendList(friend));
	else if (data.type === 'get-online-users')
		data.data.forEach(user => addOnlineUser(user));
	else if	(data.type === 'add-requests')
		showFriendRequests(data.data);
    else if(data.type === 'block-completed')
    {
        socket.send(JSON.stringify({
            type: 'get-friends-list',
            friend: data.friend
        }));
    }
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

//Handle messages

function addMessage(user, from, message, timestamp)
{
	// console.log(user);
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

//Handle online users
function createFriendList(friendName) {
    const friendList = document.getElementById('friendList');
    if (friendList)
        friendList.innerHTML = '';

    const roomButton = document.createElement('button');
    roomButton.className = 'friend-room';

    const statusDot = document.createElement('span');
    statusDot.className = 'online-status';

    const nameText = document.createTextNode(friendName);

    roomButton.appendChild(statusDot);
    roomButton.appendChild(nameText);

    roomButton.addEventListener('click', () => {
        const divFriend = document.getElementById('currentFriend');
        if (divFriend) {
            divFriend.innerHTML = '';
        }
        
        const onlineStatus = document.createElement('span');
        onlineStatus.className = 'online-status';
        
        const currentFriend = document.createElement('span');
        currentFriend.className = 'friend-name';
        currentFriend.textContent = friendName;
        
        const userDropdown = document.createElement('div');
        userDropdown.className = 'user-dropdown';
        userDropdown.id = 'userDropdown';
        
        const profileItem = document.createElement('div');
        profileItem.className = 'dropdown-item';
        
        const personIcon = document.createElement('div');
        personIcon.className = 'person-icon';
        
        const personHead = document.createElement('div');
        personHead.className = 'person-head';
        
        const personBody = document.createElement('div');
        personBody.className = 'person-body';
        
        personIcon.appendChild(personHead);
        personIcon.appendChild(personBody);
        
        const profileText = document.createElement('span');
        profileText.textContent = 'Profile';
        
        profileItem.appendChild(personIcon);
        profileItem.appendChild(profileText);
        
        const blockItem = document.createElement('div');
        blockItem.className = 'dropdown-item';
        
		const blockIcon = document.createElement('div');
        blockIcon.className = 'block-icon';

        const blockText = document.createElement('span');
        blockText.textContent = 'Block';
		
		blockItem.appendChild(blockIcon);
        blockItem.appendChild(blockText);
        
        userDropdown.appendChild(profileItem);
        userDropdown.appendChild(blockItem);
        
        currentFriend.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        
        document.addEventListener('click', () => {
            if (userDropdown.classList.contains('active')) {
                userDropdown.classList.remove('active');
            }
        });

        userDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        profileItem.addEventListener('click', () => {
            console.log('Profile clicked for', friendName);
            // Add your profile ality => here
        });
        
        
        divFriend.appendChild(onlineStatus);
        divFriend.appendChild(currentFriend);
        divFriend.appendChild(userDropdown);
        
        blockItem.addEventListener('click', () => {
            console.log('Block clicked for', friendName);
            divFriend.innerHTML = '';
            clearChatContainer();
            showNotification(`User ${friendName} has been blocked`);
            socket.send(JSON.stringify({
                type: 'block-user',
                friend: friendName
            }));
        });

        clearChatContainer();

        socket.send(JSON.stringify({
            type: 'join-room',
            friend: friendName
        }));
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
});

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

		// addButton.textContent = 'Friend Added';
		addButton.textContent = 'Request Sent';
		addButton.disabled = true;
		// socket.send(JSON.stringify({
		// 	type: 'add-friend',
		// 	friend: nameSpan.textContent
		// }));
		socket.send(JSON.stringify({
			type: 'add-friend-request',
			receiver: nameSpan.textContent
		}));
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
});

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


function addFriendRequest(requestUser)
{
    const requestsList = document.getElementById('friendRequestsList');

    const requestItem = document.createElement('div');
    requestItem.className = 'friend-request-item';

    const requestUserDiv = document.createElement('div');
    requestUserDiv.className = 'request-user';
    requestUserDiv.textContent = requestUser.sender;

    const requestActions = document.createElement('div');
    requestActions.className = 'request-actions';

    const acceptButton = document.createElement('button');
    acceptButton.className = 'accept-request';
    acceptButton.textContent = '✓';
    acceptButton.addEventListener('click', () => {
        console.log(`Friend request from ${requestUser} accepted`);
        socket.send(JSON.stringify({
            type: 'friend-request-response',
            sender: requestUser.sender,
            response: 'accept'
        }));

        requestItem.remove();
    });

    const declineButton = document.createElement('button');
    declineButton.className = 'decline-request';
    declineButton.textContent = '✗';
    declineButton.addEventListener('click', () => {
        console.log(`Friend request from ${requestUser} declined`);
        socket.send(JSON.stringify({
            type: 'friend-request-response',
            sender: requestUser.sender,
            response: 'decline'
        }));

        requestItem.remove();
    });

    requestActions.appendChild(acceptButton);
    requestActions.appendChild(declineButton);
    requestItem.appendChild(requestUserDiv);
    requestItem.appendChild(requestActions);

    requestsList.appendChild(requestItem);
}

function showFriendRequests(requests) {
    const overlay = document.getElementById('friendRequestsOverlay');
    overlay.classList.add('active');
    
    const requestsList = document.getElementById('friendRequestsList');
    
    requestsList.innerHTML = '';

    requests.forEach(request => {
        addFriendRequest(request);
    });
}

function closeFriendRequests() {
    const overlay = document.getElementById('friendRequestsOverlay');
    overlay.classList.remove('active');

	const requestsList = document.getElementById('friendRequestsList');
    requestsList.innerHTML = '';
}

const showRequestsBtn = document.getElementById('show-requests-btn');
showRequestsBtn.addEventListener('click', () => {
	socket.send(JSON.stringify({
		type: 'get-friend-request',
		receiver: username
	}));
});

const closeRequestsBtn = document.getElementById('closeRequestsBtn');
closeRequestsBtn.addEventListener('click', closeFriendRequests);

function showNotification(message, duration = 5000) {
    const container = document.getElementById('notification-container');

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    container.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            container.removeChild(notification);
        }, 300);
    }, duration);
}