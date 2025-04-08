import Page from "../Page"
import * as lib from "../../utils"
import sidebar from "../../components/sidebar"

class Chat extends Page {
	constructor() {
		super("chat", '/chat');
	}
	onMount(): void {
		sidebar.setSidebarToggler();
		document.getElementById('hide-button')?.click();

		// Add event listeners for buttons
		document.getElementById('online-friends-refresh')?.addEventListener('click',
			() => lib.showToast.blue('Refreshing online friends...'));
		document.getElementById('friend-request-button')?.addEventListener('click',
			() => lib.showToast.blue('Checking friend requests...'));
		document.getElementById('online-users-refresh')?.addEventListener('click',
			() => lib.showToast.blue('Refreshing online users...'));
		document.getElementById('chat-box-form')?.addEventListener('submit', (event) => {
			event.preventDefault();
			const message = (document.getElementById('chat-box-input') as HTMLInputElement).value.trim();
			if (message) {
				lib.showToast.green(`Message sent: ${message}`);
				(document.getElementById('chat-box-input') as HTMLInputElement).value = "";
			} else {
				lib.showToast.yellow('Empty message');
			}
		});
		document.getElementById('chat-box-profile')?.addEventListener('click',
			() => this.addOnlineFriendEntry('Name'));
		document.getElementById('chat-box-block')?.addEventListener('click',
			() => this.removeOnlineFriendEntry('Name'));
		document.getElementById('chat-box-invite')?.addEventListener('click',
			() => lib.showToast.yellow('Inviting player...'));
		document.getElementById('chat-box-profile')?.addEventListener('click',
			() => lib.showToast.green('Viewing profile...'));
		document.getElementById('chat-box-block')?.addEventListener('click',
			() => lib.showToast.red('Blocking user...'));
	}
	onCleanup(): void { }
	getHtml(): string {
		return /*html*/`
			${sidebar.getHtml()}
			<main class="card p-5 t-dashed flex w-full **:p-5 **:border **:border-c-secondary">
				<div id="friends" class="grid grid-rows-2">
					<div id="online-friends" class="flex flex-col w-75">
						<div id="online-friends-header" class="flex justify-around">
							<span>Online Friends</span>
							<button id="online-friends-refresh">
								<i class="fa-solid fa-rotate-right"></i>
							</button>
						</div>
						<div id="online-friends-list" class="flex flex-col overflow-scroll">
						</div>
					</div>
					<div id="friend-requests" class="flex flex-col w-75">
						<div id="friend-requests-list" class="flex flex-col overflow-scroll">
						</div>
						<button id="friend-request-button" class="mt-auto">🔔 Friend Requests</button>
					</div>
				</div>
				<div id="chat-box" class="flex flex-col flex-1">
					<div id="chat-box-header" class="flex justify-around">
						<span class="mr-auto">Name</span>
						<button id="chat-box-invite">invite</button>
						<button id="chat-box-profile">profile</button>
						<button id="chat-box-block">block</button>
					</div>
					<div id="chat-box-messages" class="flex flex-col overflow-scroll">
					</div>
					<form id="chat-box-form" class="flex mt-auto">
						<input id="chat-box-input" class="size-full" type="text" placeholder="Type a message..." autocomplete="off"/>
						<button id="chat-box-submit" class="ml-auto">Send</button>
					</form>
				</div>
				<div id="online-users" class="w-75">
					<div id="online-users-header" class="flex justify-around">
						<div id="online-users">Online Users</div>
						<button id="online-users-refresh">
							<i class="fa-solid fa-rotate-right"></i>
						</button>
					</div>
					<div id="online-users-list" class="flex flex-col overflow-scroll">
					</div>
				</div>
			</main>
		`;
	}
	addOnlineFriendEntry(name: string): void {
		const onlineFriendsList = document.getElementById('online-friends-list');
		if (onlineFriendsList) {
			const friendEntry = document.createElement('div');
			friendEntry.classList.add('friend-entry');
			friendEntry.textContent = name;
			onlineFriendsList.appendChild(friendEntry);
		}
	}
	removeOnlineFriendEntry(name: string): void {
		const onlineFriendsList = document.getElementById('online-friends-list');
		if (onlineFriendsList) {
			const friendEntries = onlineFriendsList.getElementsByClassName('friend-entry');
			for (const entry of Array.from(friendEntries)) {
				if (entry.textContent?.trim() === name) {
					onlineFriendsList.removeChild(entry);
					break;
				}
			}
		}
	}
}

const chat: Chat = new Chat();
export default chat;
