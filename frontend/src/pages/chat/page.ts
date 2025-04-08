import Page from "../Page"
import * as lib from "../../utils"
import sidebar from "../../components/sidebar"
import { setChatEventListeners } from "./friends";

class Chat extends Page {
	constructor() {
		super("chat", '/chat');
	}
	onMount(): void {
		sidebar.setSidebarToggler();
		document.getElementById('hide-button')?.click();

		setChatEventListeners();
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
}

const chat: Chat = new Chat();
export default chat;
