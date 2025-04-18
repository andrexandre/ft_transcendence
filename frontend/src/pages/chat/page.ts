import Page from "../Page"
import * as lib from "../../utils"
import sidebar from "../../components/sidebar"
import { setChatEventListeners } from "./friends";

class Chat extends Page {
	constructor() {
		super("chat", '/chat');
	}
	onMount(): void {
		sidebar.setSidebarToggler('chat');
		setChatEventListeners();
		if (lib.userInfo.profileImage)
			(document.getElementById('chat-box-profile-image') as HTMLImageElement).src = lib.userInfo.profileImage;
	}
	onCleanup(): void { }
	getHtml(): string {
		return /*html*/`
			${sidebar.getHtml()}
			<main class="card p-5 t-dashed flex flex-1 **:p-5 **:border **:border-c-secondary">
				<div class="grid grid-rows-2">
					<div class="flex flex-col w-75">
						<div class="flex justify-around">
							<span>Online Friends</span>
							<button id="online-friends-refresh">
								<i class="fa-solid fa-rotate-right"></i>
							</button>
						</div>
						<div id="online-friends-list" class="flex flex-col flex-1 overflow-auto"></div>
					</div>
					<div class="flex flex-col w-75">
						<div id="friend-requests-list" class="flex flex-col flex-1 overflow-auto"></div>
						<div class="flex justify-around">
							<span>Friend Requests</span>
							<button id="friend-request-button" class="mt-auto">
								<i class="fa-solid fa-rotate-right"></i>
							</button>
						</div>
					</div>
				</div>
				<div class="flex flex-col flex-1">
					<div class="flex justify-around">
						<img id="chat-box-profile-image" class="object-cover size-20" src="https://picsum.photos/id/237/200">
						<span id="chat-box-header-username" class="mr-auto">Name</span>
						<button id="chat-box-profile">profile</button>
						<button id="chat-box-invite">invite</button>
						<button id="chat-box-block">block</button>
					</div>
					<div id="chat-box-message-list" class="flex flex-col flex-1 overflow-auto"></div>
					<form id="chat-box-form" class="flex mt-auto">
						<input id="chat-box-input" class="size-full" type="text" placeholder="Type a message..." autocomplete="off"/>
						<button class="ml-auto">Send</button>
					</form>
				</div>
				<div class="flex flex-col w-75">
					<div class="flex justify-around">
						<span>Online Users</span>
						<button id="online-users-refresh">
							<i class="fa-solid fa-rotate-right"></i>
						</button>
					</div>
					<div id="online-users-list" class="flex flex-col flex-1 overflow-auto"></div>
				</div>
			</main>
		`;
	}
}

const chat: Chat = new Chat();
export default chat;
