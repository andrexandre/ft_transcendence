import Page from "./Page"
import * as lib from "../utils"
import sidebar from "../components/sidebar"

const safeColors: string[] = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500", "bg-lime-500", "bg-green-500", "bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-sky-500", "bg-blue-500", "bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", "bg-pink-500", "bg-rose-500", "bg-slate-500", "bg-gray-500", "bg-zinc-500", "bg-neutral-500", "bg-stone-500"];

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
		// Set up the image selector
		if (lib.userInfo.profileImage)
			(document.getElementById('profile-image') as HTMLImageElement).src = lib.userInfo.profileImage;
		document.getElementById('profile-image-button')?.addEventListener('click', async (e: Event) => {
			e.preventDefault();
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

		// Set up the 2fa toggle
		const twoFAButton = document.getElementById('2fa-toggle') as HTMLInputElement;
		twoFAButton.checked = true;
		twoFAButton.addEventListener('click', () => {
			if (twoFAButton.checked) {
				lib.showToast.green("2FA enabled");
			} else {
				lib.showToast.red("2FA disabled");
			}
		});

		// Set up the theme selector
		document.querySelectorAll('input[name="theme"]').forEach(radio => {
			const radioButton = radio as HTMLInputElement;
			radioButton.addEventListener('change', () => lib.setTheme(radioButton.value, true));
		});
		(document.querySelector(`input[name="theme"][value="${lib.getTheme()}"]`) as HTMLInputElement).checked = true;
		
		// Set up color selector
		const colorSelector = document.getElementById('color-selector');
		for (const color of lib.colors) {
			const el = document.createElement('li');
			el.className = 'size-10';
			el.innerHTML = /*html*/`
				<input type="radio" id="${color}-color" name="color" value="${color}" class="hidden peer">
				<label for="${color}-color" class="flex size-full items-center justify-center rounded-xl cursor-pointer bg-${color}-500 shadow-neutral-400 peer-checked:border peer-checked:shadow-md dark:peer-checked:border-white peer-checked:border-black">
				</label>
			`;
			colorSelector?.appendChild(el);
			const radioButton = el.querySelector('input');
			radioButton?.addEventListener('change', () => lib.setColor(radioButton.value, true));
		}
		(document.querySelector(`input[name="color"][value="${localStorage.getItem('color') || lib.defaultColor}"]`) as HTMLInputElement).checked = true;
		
		getAndUpdateInfo();
		// this.saveProfileInformation();
	}
	onCleanup(): void { }
	getHtml(): string {
		return /*html*/`
			${sidebar.getHtml()}
			<main class="grid grid-cols-2 max-2xl:grid-cols-1 flex-1 card t-dashed text-start overflow-auto">
				<div id="col-1 flex-1">
					<form id="profile" class="card flex flex-col overflow-auto" action="#">
						<h1 class="item text-start text-2xl">Profile</h1>
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
					<div class="flex justify-between item">
						<h1>2 Factor Authentication</h1>
						<label class="h-7 w-12">
							<input type="checkbox" class="sr-only peer" id="2fa-toggle">
							<div class="h-full relative t-dashed peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:start-0.5 peer-checked:after:bg-c-text dark:peer-checked:after:bg-c-bg after:size-5 after:bg-c-secondary dark:after:bg-c-primary after:transition-all after:rounded-full"></div>
						</label>
					</div>
				</div>
				<div id="col-2" class="flex flex-col">
					<div class="flex justify-between item items-center">
						<h1>Themes</h1>
						<ul class="flex t-dashed rounded-full p-1">
							<li class="size-10">
								<input type="radio" id="auto-theme" name="theme" value="auto" class="hidden peer">
								<label for="auto-theme" class="flex size-full items-center justify-center rounded-full cursor-pointer peer-checked:bg-c-primary peer-checked:text-c-bg">
									<i class="fa-solid fa-desktop"></i>
								</label>
							</li>
							<li class="size-10">
								<input type="radio" id="light-theme" name="theme" value="light" class="hidden peer">
								<label for="light-theme" class="flex size-full items-center justify-center rounded-full cursor-pointer peer-checked:bg-c-primary peer-checked:text-c-bg">
									<i class="fa-solid fa-sun"></i>
								</label>
							</li>
							<li class="size-10">
								<input type="radio" id="dark-theme" name="theme" value="dark" class="hidden peer">
								<label for="dark-theme" class="flex size-full items-center justify-center rounded-full cursor-pointer peer-checked:bg-c-primary peer-checked:text-c-bg">
									<i class="fa-solid fa-moon"></i>
								</label>
							</li>
						</ul>
					</div>
					<div class="item flex flex-col items-start">
						<h1>Color</h1>
						<ul id="color-selector" class="mt-6 grid grid-cols-11 gap-4">
						</ul>
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