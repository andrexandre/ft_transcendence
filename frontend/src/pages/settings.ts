import Page from "./Page"
import * as lib from "../utils"
import sidebar from "../components/sidebar"
import { renderProfileUsername } from "./dashboard"

class Settings extends Page {
	constructor() {
		super("settings", '/settings');
	}
	onMount(): void {
		sidebar.setSidebarToggler('settings');
		renderProfileUsername();
		(async () => {
			const response = await fetch('http://127.0.0.1:3000/api/user/info', {
				credentials: "include"
			});

			if (!response.ok) {
				lib.showToast("Fetch failed");
			}
			const data = await response.json();
			console.log(data);

			const username = document.getElementById('profile-username') as HTMLElement;
			const codename = document.getElementById('codename') as HTMLElement;
			const biography = document.getElementById('bio') as HTMLElement;

			username.textContent = data.username;
			codename.textContent = data.codename;
			biography.textContent = data.biography;


		})();
		// const buttons = document.querySelectorAll('#theme-selector button');
		// buttons.forEach(button => {
		// 	button.addEventListener('click', () => {
		// 		buttons.forEach(btn => btn.setAttribute("data-state", "inactive"));
		// 		button.setAttribute("data-state", "active");
		// 	});
		// });
		// document.getElementById(`light-theme-button`)!.addEventListener('click', () => lib.setTheme("light"));
		// document.getElementById(`dark-theme-button`)!.addEventListener('click', () => lib.setTheme("dark"));
		// document.getElementById(`auto-theme-button`)!.addEventListener('click', () => lib.setTheme("auto"));
	}
	onCleanup(): void {
		// lib.setTheme("light");
	}
	getHtml(): string {
		return /*html*/`
			${sidebar.getHtml()}
			<main class="flex flex-col flex-1 card t-dashed text-start">
				<h1 class="item text-2xl">Profile</h1>
				<div id="profile" class="card t-dashed grid overflow-scroll lg:w-3/4 min-h-[400px]">
					<div class="flex gap-16">
						<img class="rounded-full size-48 shadow-xl shadow-neutral-400 border-2" src="https://picsum.photos/id/237/200">
						<div class="justify-center self-center">
							<h1 id="profile-username" class="text-3xl font-bold">Loading...</h1>
							<p id="codename" class="text-xl">The mighty tail-wagger</p>
						</div>
					</div>
					<p id="bio" >Champion of belly rubs, fetch, and fierce squirrel chases. Sir Barkalot is the first to answer the doorbell with a royal bark. His hobbies include digging to China and chewing shoes.</p>
					<!-- Botão de Update -->
					<button id="update-profile-button" class="mt-4 px-4 py-2 rounded-xl bg-c-primary text-white hover:bg-c-primary/80 transition">
					Update Information
					</button>
				</div>
			</main>
		`;
	}
}

const settings: Settings = new Settings();
export default settings;
