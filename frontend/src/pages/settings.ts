import Page from "./Page"
import * as lib from "../utils"
import sidebar from "../components/sidebar"
import { renderProfileUsername } from "./dashboard"

//! remove this to refactor
export async function renderProfileInfo() {
	if (!lib.userInfo.username) //! remove
		await new Promise(r => setTimeout(r, 100)); //! remove
	(document.getElementById("profile-username") as HTMLInputElement).value = lib.userInfo.username || "Sir Barkalot";
	// (document.getElementById("email-username") as HTMLInputElement).value = lib.userInfo.email || "Sir Barkalot";
}

async function getAndUpdateInfo() {
	try {
		const response = await fetch('http://127.0.0.1:7000/fetchDashboardData', {
			credentials: 'include',
		});
		if (!response.ok) {
			lib.navigate('/login');
			throw new Error(`${response.status} - ${response.statusText}`);
		}
		let dashData = await response.json();
		lib.userInfo.username = dashData.username
		lib.userInfo.userId = dashData.userId
		lib.userInfo.auth_method = dashData.auth_method
		renderProfileUsername();
	} catch (error) {
		console.log(error);
		lib.showToast.red(error as string);
	}
}

class Settings extends Page {
	constructor() {
		super("settings", '/settings');
	}
	onMount(): void {
		sidebar.setSidebarToggler('settings');
		const buttons = document.querySelectorAll('#theme-selector button');
		buttons.forEach(button => {
			button.addEventListener('click', () => {
				buttons.forEach(btn => btn.setAttribute("data-state", "inactive"));
				button.setAttribute("data-state", "active");
			});
		});
		document.getElementById(`light-theme-button`)!.addEventListener('click', () => lib.setTheme("light", true));
		document.getElementById(`dark-theme-button`)!.addEventListener('click', () => lib.setTheme("dark", true));
		document.getElementById(`auto-theme-button`)!.addEventListener('click', () => lib.setTheme("auto", true));

		document.getElementById("profile-save-button")!.addEventListener("click", () => {
			lib.showToast("Button worked");
			console.log((document.getElementById("profile-username") as HTMLInputElement).value);
			console.log((document.getElementById("profile-codename") as HTMLInputElement).value);
			console.log((document.getElementById("profile-email") as HTMLInputElement).value);
			console.log((document.getElementById("profile-bio") as HTMLInputElement).value);
			const test = (document.getElementById("profile-avatar") as HTMLImageElement);
			// console.log(test.);
			// console.log((document.getElementById("profile-username") as HTMLInputElement).value);
		});
		renderProfileInfo(); //! remove
		// getAndUpdateInfo();
	}
	onCleanup(): void {
		// lib.setTheme("light");
	}
	getHtml(): string {
		return /*html*/`
			${sidebar.getHtml()}
			<main class="flex flex-col flex-1 card t-dashed text-start">
				<h1 class="item text-2xl">Settings</h1>
				<form id="profile" class="card t-dashed grid overflow-scroll min-2xl:w-1/2" action="#">
					<div class="flex gap-16">
						<img id="profile-avatar" class="rounded-full size-48 shadow-xl shadow-neutral-400 border-2" src="https://picsum.photos/id/237/200">
						<div class="flex flex-col justify-center self-center gap-4">
							<label class="text-left font-bold" for="profile-username">Username</label>
							<input class="p-1 t-dashed pl-4" type="text" id="profile-username" placeholder="Enter username" />
							<label class="text-left font-bold" for="profile-codename">Codename</label>
							<input class="p-1 t-dashed pl-4" type="text" id="profile-codename" placeholder="Enter codename" value="The mighty tail-wagger"/>
							<label class="text-left font-bold" for="profile-email">Email</label>
							<input class="p-1 t-dashed pl-4" type="text" id="profile-email" placeholder="Enter email" value="email@gmail.com"/>
						</div>
					</div>
					<label class="text-left font-bold" for="profile-bio">Biography</label>
					<textarea class="p-1 t-dashed pl-4" name="bio" id="profile-bio">Champion of belly rubs, fetch, and fierce squirrel chases. Sir Barkalot is the first to answer the doorbell with a royal bark. His hobbies include digging to China and chewing shoes.</textarea>
					<button id="profile-save-button" class="item t-dashed" type="submit">Submit</button>
				</form>
				<h1 class="item text-2xl">Themes</h1>
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