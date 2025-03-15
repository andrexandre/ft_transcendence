import Page from "./Page"
import * as lib from "../utils"

class Dashboard extends Page {
	constructor() {
		super("dashboard", '/');
	}
	onMount(): void {
		this.setSidebarToggler();
		document.getElementById("game-button")!.addEventListener("click", () => {
			window.location.href = "http://127.0.0.1:5000";
		});
		document.getElementById("chat-button")!.addEventListener("click", () => {
			window.location.href = "http://127.0.0.1:2000/?user=Antony";
		});
		document.getElementById("notifications-button")!.addEventListener("click", () => {
			lib.showToast();
		});
		lib.assignButtonNavigation('settings-button', '/login');
	}
	onCleanup(): void {}
	getHtml(): string {
		return /*html*/`
			<aside id="sidebar" class="dash-component transition-all p-3 w-[200px]">
				<ul id="sidebar-list" class="sidebar-list">
					<li>
						<button id="hide-button" class="sidebar-component">
							<i class="fa-solid fa-arrow-left"></i>
							<p>Hide</p>
						</button>
					</li>
					<li>
						<button id="home-button" class="sidebar-component">
							<i class="fa-solid fa-home"></i>
							<p>Home</p>
						</button>
					</li>
					<li>
						<button id="chat-button" class="sidebar-component">
							<i class="fa-solid fa-message"></i>
							<p>Chat</p>
						</button>
					</li>
					<li>
						<button id="game-button" class="sidebar-component">
							<i class="fa-solid fa-gamepad"></i>
							<p>Game</p>
						</button>
					</li>
					<li>
						<button id="notifications-button" class="sidebar-component">
							<i class="fa-solid fa-bell"></i>
							<p>Notifications</p>
						</button>
					</li>
					<li class="mt-auto">
						<button id="settings-button" class="sidebar-component">
							<i class="fa-solid fa-gear"></i>
							<p>Settings</p>
						</button>
					</li>
				</ul>
			</aside>
			<main class="grid grid-cols-2 grid-rows-2 flex-1">
				<div id="profile" class="dash-component p-10 grid">
					<div class="profile-header">
						<img class="rounded-full size-48 shadow-xl shadow-stone-400 border-2" src="https://picsum.photos/id/237/200">
						<div class="justify-center self-center">
							<h1 class="text-3xl font-bold">Sir Barkalot</h1>
							<p class="text-xl">The mighty tail-wagger</p>
						</div>
					</div>
					<p class="max-lg:truncate">Champion of belly rubs, fetch, and fierce squirrel chases. Sir Barkalot is the first to answer the doorbell with a royal bark. His hobbies include digging to China and chewing shoes.</p>
				</div>
				<div id="ad" class="dash-component p-10">
					<h1 class="text-xl font-bold">Let's Play Pong</h1>
				</div>
				<div id="stats" class="dash-component p-10 grid">
					<h1 class="text-xl font-bold">Pong Stats</h1>
					<div class="dash-component"></div>
					<div class="dash-component"></div>
					<div class="dash-component"></div>
					<div class="dash-component"></div>
					<div class="dash-component"></div>
				</div>
				<div id="friends" class="dash-component p-10 flex flex-col justify-around">
					<h1 class="text-xl font-bold">Active friends</h1>
					<div class="dash-component p-3 flex">
						<img src="https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Brian" class="size-10 rounded-4xl">
						<svg height="10" width="10"><circle cx="5" cy="5" r="5" fill="green" /></svg>
						<h1 class="font-bold self-center ml-5">Brian</h1>
					</div>
					<div class="dash-component p-3 flex">
						<img src="https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Eliza" class="size-10 rounded-4xl">
						<svg height="10" width="10"><circle cx="5" cy="5" r="5" fill="grey" /></svg>
						<h1 class="font-bold self-center ml-5">Eliza</h1>
					</div>
					<div class="dash-component p-3 flex">
						<img src="https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Alexander" class="size-10 rounded-4xl">
						<svg height="10" width="10"><circle cx="5" cy="5" r="5" fill="grey" /></svg>
						<h1 class="font-bold self-center ml-5">Alexander</h1>
					</div>
				</div>
			</main>
			`
	}
	setSidebarToggler() {
		const sidebar = document.getElementById('sidebar');
		const sidebarList = document.getElementById('sidebar-list');
		const closeButton = document.getElementById('hide-button');

		const handler = () => {
			const pElements = sidebar?.querySelectorAll('p');
			if (!sidebar || !sidebarList)
				return lib.showToast.failure();
			pElements?.forEach(p => {
				if (p.style.display === 'none') {
					p.previousElementSibling?.classList.replace('fa-bars', 'fa-arrow-left');
					sidebar.style.width = '200px';
					p.style.display = 'block';
					sidebarList.classList.remove('place-items-center');
				} else {
					p.previousElementSibling?.classList.replace('fa-arrow-left', 'fa-bars');
					sidebar.style.width = '70px';
					p.style.display = 'none';
					sidebarList.classList.add('place-items-center');
				}
			});
		}
		closeButton?.addEventListener('click', handler);
		this.addCleanupHandler(() => closeButton?.removeEventListener('click', handler));
	}
}

const dashboard: Dashboard = new Dashboard();
export default dashboard;
