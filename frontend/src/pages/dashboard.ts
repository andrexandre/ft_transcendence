import Page from "./Page"
import * as lib from "../utils"
import sidebar from "../components/sidebar"

class Dashboard extends Page {
	constructor() {
		super("dashboard", '/');
	}
	onMount(): void {
		sidebar.setSidebarToggler();
	}
	onCleanup(): void { }
	getHtml(): string {
		return /*html*/`
			${sidebar.getHtml()}
			<main class="grid grid-cols-2 grid-rows-2 flex-1">
				<div id="profile" class="card t-dashed grid overflow-scroll">
					<div class="flex gap-16">
						<img class="rounded-full size-48 shadow-xl shadow-neutral-400 border-2" src="https://picsum.photos/id/237/200">
						<div class="justify-center self-center">
							<h1 class="text-3xl font-bold">${this.showUsername()}</h1>
							<p class="text-xl">The mighty tail-wagger</p>
						</div>
					</div>
					<p>Champion of belly rubs, fetch, and fierce squirrel chases. Sir Barkalot is the first to answer the doorbell with a royal bark. His hobbies include digging to China and chewing shoes.</p>
				</div>
				<div id="ad" class="card t-dashed">
					<h1 class="text-xl font-bold">Let's Play Pong</h1>
				</div>
				<div id="stats" class="card t-dashed grid">
					<h1 class="text-xl font-bold">Pong Stats</h1>
					<div class="item t-dashed"></div>
					<div class="item t-dashed"></div>
					<div class="item t-dashed"></div>
					<div class="item t-dashed"></div>
					<div class="item t-dashed"></div>
				</div>
				<div id="friends" class="card t-dashed flex flex-col justify-around overflow-scroll">
					<h1 class="text-xl font-bold">Active friends</h1>
					<div class="item t-dashed p-3 flex">
						<img src="https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Brian" class="size-10 rounded-4xl">
						<svg height="10" width="10"><circle cx="5" cy="5" r="5" fill="green" /></svg>
						<h1 class="font-bold self-center ml-5">Brian</h1>
					</div>
					<div class="item t-dashed p-3 flex">
						<img src="https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Eliza" class="size-10 rounded-4xl">
						<svg height="10" width="10"><circle cx="5" cy="5" r="5" fill="grey" /></svg>
						<h1 class="font-bold self-center ml-5">Eliza</h1>
					</div>
					<div class="item t-dashed p-3 flex">
						<img src="https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Alexander" class="size-10 rounded-4xl">
						<svg height="10" width="10"><circle cx="5" cy="5" r="5" fill="grey" /></svg>
						<h1 class="font-bold self-center ml-5">Alexander</h1>
					</div>
				</div>
			</main>
		`
	}
	showUsername(): string {
		let line: string = '';
		if (lib.userInfo.username) {
			if (lib.userInfo.auth_method === "google")
				line = "G. ";
			else if (lib.userInfo.auth_method === "email")
				line = "E. ";
			return line + lib.userInfo.username;
		}
		else
			return "Sir Barkalot";
	}
}

const dashboard: Dashboard = new Dashboard();
export default dashboard;
