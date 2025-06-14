import Page from "../Page"
import * as lib from "../../utils"
import sidebar from "../../components/sidebar"
import { setChatEventListeners, disableAutoReload } from "./friends";

class Chat extends Page {
	constructor() {
		super("chat", '/chat');
	}
	onMount(): void {
		sidebar.setSidebarToggler('chat');
		setChatEventListeners();
	}
	onCleanup(): void {
		disableAutoReload()
	}
	getHtml(): string {
		return /*html*/`
			${sidebar.getHtml()}
			<main class="grid grid-cols-[auto_1fr_auto] lg:grid-cols-[300px_1fr_300px] grid-rows-1 flex-1">
				<div class="flex flex-col card t-dashed p-5">
					<div class="flex flex-col gap-6 h-2/3">
						<button id="friends-list-refresh" class="flex gap-4 items-center item t-dashed p-4 justify-center">
							<i class="fa-solid fa-user-group"></i>
							<span>Friends</span>
						</button>
						<ul id="friends-list" class="flex flex-col flex-1 overflow-auto"></ul>
					</div>
					<hr class="text-c-primary">
					<div class="flex flex-col gap-6 h-1/3">
						<ul id="friend-requests-list" class="flex flex-col flex-1 overflow-auto"></ul>
						<button id="friend-requests-list-refresh" class="flex gap-4 items-center item t-dashed p-4 justify-center">
							<i class="fa-solid fa-bell"></i>
							<span>Friend Requests</span>
						</button>
					</div>
				</div>
				<div id="chat-box" class="flex flex-col flex-1 card t-dashed p-5">
					<div class="flex px-4 item t-dashed gap-3">
						<button id="chat-box-profile" class="flex gap-4 mr-auto" disabled>
							<img id="chat-box-profile-image" class="object-cover size-10 rounded-full">
							<span id="chat-box-header-username" class="flex items-center">No user selected</span>
						</button>
						<button id="chat-box-invite-button" class="truncate px-3 rounded-2xl hover:bg-c-secondary dark:hover:bg-c-primary" disabled>Invite to game</button>
						<button id="accept-invite-to-game-button" class="hidden px-3 rounded-2xl hover:bg-c-secondary dark:hover:bg-c-primary" disabled>Accept</button>
						<button id="reject-invite-to-game-button" class="hidden px-3 rounded-2xl hover:bg-c-secondary dark:hover:bg-c-primary" disabled>Reject</button>
						<button id="chat-box-block-button" class="px-3 rounded-2xl hover:bg-c-secondary dark:hover:bg-c-primary" disabled>Block</button>
					</div>
					<ul id="chat-box-message-list" class="flex flex-col flex-1 overflow-auto"></ul>
					<form id="chat-box-form" class="flex item t-dashed gap-4">
						<input id="chat-box-input" class="size-full pl-2" type="text" placeholder="Type a message..." name="nope" autocomplete="new-password" pattern="^[^<>]+$" disabled/>
						<button id="chat-box-send-button" class="p-2 rounded-2xl hover:bg-c-secondary dark:hover:bg-c-primary" disabled>Send</button>
					</form>
				</div>
				<div class="flex flex-col card t-dashed p-5">
					<div class="flex flex-col gap-6 h-full">
						<button id="users-list-refresh" class="flex gap-4 items-center item t-dashed p-4 justify-center">
							<i class="fa-solid fa-users"></i>
							<span>Users</span>
						</button>
						<ul id="users-list" class="flex flex-col flex-1 overflow-auto"></ul>
					</div>
					<hr class="text-c-primary">
					<div id="game-notifications-container" class="flex flex-col gap-6 h-fit">
						<ul id="game-notifications-list" class="hidden flex-col flex-1 overflow-auto"></ul>
						<button id="game-notifications-list-refresh" class="flex gap-4 items-center item t-dashed p-4 justify-center">
							<i class="fa-solid fa-comments"></i>
							<span>Notifications</span>
						</button>
					</div>
				</div>
			</main>
		`;
	}
}

const chat: Chat = new Chat();
export default chat;
