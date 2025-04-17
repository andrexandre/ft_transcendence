import Page from "./Page"
import * as lib from "../utils"
import sidebar from "../components/sidebar"

export async function renderProfileUsername() {
	const profileUsername = document.getElementById("profile-username") as HTMLInputElement;
	let line: string = '';
	if (lib.userInfo.username) {
		if (lib.userInfo.auth_method === "google")
			line = "G. ";
		else if (lib.userInfo.auth_method === "email")
			line = "E. ";
		profileUsername.value = line + lib.userInfo.username;
	}
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
		// Set up the theme selector
		const themeSelectorButtons = document.querySelectorAll('#theme-selector button');
		themeSelectorButtons.forEach(button => {
			button.addEventListener('click', () => {
				themeSelectorButtons.forEach(btn => btn.setAttribute("data-state", "inactive"));
				button.setAttribute("data-state", "active");
			});
		});
		document.getElementById(`${lib.getTheme()}-theme-button`)!.click();
		document.getElementById(`light-theme-button`)!.addEventListener('click', () => lib.setTheme("light", true));
		document.getElementById(`dark-theme-button`)!.addEventListener('click', () => lib.setTheme("dark", true));
		document.getElementById(`auto-theme-button`)!.addEventListener('click', () => lib.setTheme("auto", true));

		const twoFAButton = document.getElementById('2fa-toggle') as HTMLInputElement;
		twoFAButton.checked = true;
		twoFAButton.addEventListener('click', () => {
			if (twoFAButton.checked) {
				lib.showToast.green("2FA enabled");
			} else {
				lib.showToast.red("2FA disabled");
			}
		});
		if (lib.userInfo.profileImage)
			(document.getElementById('profile-image') as HTMLImageElement).src = lib.userInfo.profileImage;
		document.getElementById('profile-image-button')?.addEventListener('click', async () => {
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = 'image/*';
			input.addEventListener('change', async (event) => {
				const file = (event.target as HTMLInputElement).files?.[0];
				console.log(file);
				if (file) {
					const reader = new FileReader();
					reader.onload = () => {
						lib.userInfo.profileImage = reader.result as string;
						const profileImage = document.getElementById('profile-image') as HTMLImageElement;
						profileImage.src = lib.userInfo.profileImage;
						lib.showToast.green("Profile image updated successfully!");
					};
					reader.readAsDataURL(file);
				}
			});
			input.click();
		});

		getAndUpdateInfo();
		// this.saveProfileInformation();
	}
	onCleanup(): void {}
	getHtml(): string {
		return /*html*/`
			${sidebar.getHtml()}
			<main class="flex flex-col flex-1 card t-dashed text-start">
				<h1 class="item text-2xl">Settings</h1>
				<form id="profile" class="card t-dashed grid overflow-scroll min-2xl:w-1/2" action="#">
					<div class="flex">
						<button id="profile-image-button" class="relative size-60 group">
							<img id="profile-image" src="https://picsum.photos/id/237/240" class="rounded-full size-full object-cover border-2 shadow-lg shadow-neutral-400"/>
							<div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
								<i class="fa-solid fa-camera"></i>
							</div>
						</button>
						<div class="flex flex-col justify-center self-center gap-4 ml-20">
							<label class="text-left font-bold" for="profile-username">Username</label>
							<input class="p-1 t-dashed pl-4" type="text" id="profile-username" placeholder="Enter username" value="Sir Barkalot" />
							<label class="text-left font-bold" for="profile-codename">Codename</label>
							<input class="p-1 t-dashed pl-4" type="text" id="profile-codename" placeholder="Enter codename" value="The mighty tail-wagger"/>
							<label class="text-left font-bold" for="profile-email">Email</label>
							<input class="p-1 t-dashed pl-4" type="text" id="profile-email" placeholder="Enter email" value="example@email.com"/>
						</div>
					</div>
					<label class="text-left font-bold" for="profile-bio">Biography</label>
					<textarea class="p-1 t-dashed pl-4" name="bio" id="profile-bio">Champion of belly rubs, fetch, and fierce squirrel chases. Sir Barkalot is the first to answer the doorbell with a royal bark. His hobbies include digging to China and chewing shoes.</textarea>
					<button class="item t-dashed" type="submit">Save</button>
				</form>
				<div class="flex flex-col min-2xl:w-1/2">
					<div class="flex justify-between item items-center">
						<h1>Themes</h1>
						<div id="theme-selector" class="items-center t-dashed size-fit *:cursor-pointer">
							<button id="auto-theme-button" class="item rounded-full size-10 data-[state='active']:bg-c-primary data-[state='active']:text-c-bg">
								<i class="fa-solid fa-desktop"></i>
							</button>
							<button id="light-theme-button" class="item rounded-full size-10 data-[state='active']:bg-c-primary data-[state='active']:text-c-bg">
								<i class="fa-solid fa-sun"></i>
							</button>
							<button id="dark-theme-button" class="item rounded-full size-10 data-[state='active']:bg-c-primary data-[state='active']:text-c-bg">
								<i class="fa-solid fa-moon"></i>
							</button>
						</div>
					</div>
					<div class="flex justify-between item">
						<h1>2 Factor Authentication</h1>
						<label class="h-7 w-12">
							<input type="checkbox" class="sr-only peer" id="2fa-toggle">
							<div class="h-full relative t-dashed peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:start-[2px] peer-checked:after:bg-c-bg after:bg-c-primary after:size-5 peer-checked:after:border-c-primary after:transition-all after:rounded-full"></div>
						</label>
					</div>
				</div>
			</main>
		`;
	}
	saveProfileInformation() {
		const form = document.querySelector('form');
		const handler = async (e: Event) => {
			e.preventDefault();
			const userData: { username: string; codename: string; email: string; bio: string; } = {
				username: (document.getElementById('profile-username') as HTMLInputElement).value,
				codename: (document.getElementById('profile-codename') as HTMLInputElement).value,
				email: (document.getElementById('profile-email') as HTMLInputElement).value,
				bio: (document.getElementById('profile-bio') as HTMLTextAreaElement).value,
				// image: (document.getElementById("profile-avatar") as HTMLImageElement)
			};
			// try {
			// 	const response = await fetch('http://127.0.0.1:7000/api/user/info', {
			// 		method: 'POST',
			// 		credentials: "include",
			// 		headers: {
			// 			'Content-Type': 'application/json'
			// 		},
			// 		body: JSON.stringify(userData)
			// 	});
			// 	if (!response.ok) {
			// 		throw new Error(`${response.status} - ${response.statusText}`);
			// 	}
			// } catch (error) {
			// 	console.log(error);
			// 	lib.showToast.red(error as string);
			// }
		};
		form?.addEventListener('submit', handler);
		this.addCleanupHandler(() => form?.removeEventListener('submit', handler));
	}
}

const settings: Settings = new Settings();
export default settings;