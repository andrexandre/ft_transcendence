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
		const buttons = document.querySelectorAll('#theme-selector button');
		buttons.forEach(button => {
			button.addEventListener('click', () => {
				buttons.forEach(btn => btn.setAttribute("data-state", "inactive"));
				button.setAttribute("data-state", "active");
			});
		});
		document.getElementById(`light-theme-button`)!.addEventListener('click', () => lib.setTheme("light"));
		document.getElementById(`dark-theme-button`)!.addEventListener('click', () => lib.setTheme("dark"));
		document.getElementById(`auto-theme-button`)!.addEventListener('click', () => lib.setTheme("auto"));
	}
	onCleanup(): void {
		// lib.setTheme("light");
	}
	getHtml(): string {
		return /*html*/`
			${sidebar.getHtml()}
			<main class="flex flex-col flex-1 card t-dashed text-start">
				<h1 class="item text-2xl">Profile</h1>
				<div id="profile" class="card t-dashed grid overflow-scroll lg:w-1/2">
					<div class="flex gap-16">
						<img class="rounded-full size-48 shadow-xl shadow-neutral-400 border-2" src="https://picsum.photos/id/237/200">
						<div class="justify-center self-center">
							<h1 id="profile-username" class="text-3xl font-bold">Loading...</h1>
							<p class="text-xl">The mighty tail-wagger</p>
						</div>
					</div>
					<p>Champion of belly rubs, fetch, and fierce squirrel chases. Sir Barkalot is the first to answer the doorbell with a royal bark. His hobbies include digging to China and chewing shoes.</p>
				</div>
				<h1 class="item text-2xl">Settings</h1>
				<div>
					<p class="m-2 text-c-secondary">Themes are only enabled on here</p>
					<div id="theme-selector" class="items-center gap-4 t-border size-fit">
						<button id="auto-theme-button" class="item data-active:bg-c-primary data-active:text-c-bg">
							<i class="fa-solid fa-desktop"></i>
						</button>
						<button id="light-theme-button" class="item data-active:bg-c-primary data-active:text-c-bg">
							<i class="fa-solid fa-sun"></i>
						</button>
						<button id="dark-theme-button" class="item data-active:bg-c-primary data-active:text-c-bg">
							<i class="fa-solid fa-moon"></i>
						</button>
					</div>
				</div>
			</main>
		`;
	}
}

const settings: Settings = new Settings();
export default settings;