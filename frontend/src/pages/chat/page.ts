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
			<main class="flex flex-1">
				<div class="flex flex-col card t-dashed p-5 w-75">
					<div class="flex flex-col gap-6 h-2/3">
						<button id="friends-list-refresh" class="flex justify-around items-center item t-dashed p-4">
							<span>Friends</span>
							<i class="fa-solid fa-rotate-right"></i>
						</button>
						<ul id="friends-list" class="flex flex-col flex-1 overflow-auto"></ul>
					</div>
					<hr class="text-c-primary">
					<div class="flex flex-col gap-6 h-1/3">
						<ul id="friend-requests-list" class="flex flex-col flex-1 overflow-auto"></ul>
						<button id="friend-requests-list-refresh" class="flex justify-around items-center item t-dashed p-4">
							<span>Friend Requests</span>
							<i class="fa-solid fa-rotate-right"></i>
						</button>
					</div>
				</div>
				<div id="chat-box" class="flex flex-col flex-1 card t-dashed p-5">
					<div class="flex px-4 item t-dashed gap-3">
						<button id="chat-box-profile" class="flex gap-4 mr-auto" disabled>
							<img id="chat-box-profile-image" class="object-cover size-10 rounded-full" src="https://picsum.photos/id/237/200">
							<span id="chat-box-header-username" class="flex items-center">No user selected</span>
						</button>
						<button id="chat-box-invite" class="px-3 rounded-2xl hover:bg-c-secondary dark:hover:bg-c-primary" disabled>Invite</button>
						<button id="chat-box-block" class="px-3 rounded-2xl hover:bg-c-secondary dark:hover:bg-c-primary" disabled>Block</button>
					</div>
					<ul id="chat-box-message-list" class="flex flex-col flex-1 overflow-auto"></ul>
					<form id="chat-box-form" class="flex item t-dashed gap-4">
						<input id="chat-box-input" class="size-full pl-2" type="text" placeholder="Type a message..." name="nope" autocomplete="new-password" disabled/>
						<button class="p-2 rounded-2xl hover:bg-c-secondary dark:hover:bg-c-primary" id="chat-box-send-button" disabled>Send</button>
					</form>
				</div>
				<div class="flex flex-col w-75 gap-6 card t-dashed p-5">
					<button id="users-list-refresh" class="flex justify-around items-center item t-dashed p-4">
						<span>Users</span>
						<i class="fa-solid fa-rotate-right"></i>
					</button>
					<ul id="users-list" class="flex flex-col flex-1 overflow-auto"></ul>
				</div>
			</main>
		`;
	}
}

const chat: Chat = new Chat();
export default chat;
