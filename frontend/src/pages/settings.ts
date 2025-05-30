import Page from "./Page"
import * as lib from "../utils"
import sidebar from "../components/sidebar"
import { renderProfileImage } from "./dashboard";
import { turnOffChat, turnOnChat } from "./chat/friends";

const safeColors: string[] = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500", "bg-lime-500", "bg-green-500", "bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-sky-500", "bg-blue-500", "bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", "bg-pink-500", "bg-rose-500", "bg-slate-500", "bg-gray-500", "bg-zinc-500", "bg-neutral-500", "bg-stone-500"];

async function loadInformation() {
	try {
		const response = await fetch(`http://${location.hostname}:8080/api/users/settings`, {
			credentials: 'include'
		})
		if (!response.ok)
			throw new Error((await response.json()).message);

		// Set user information
		const userData = await response.json();
		(document.getElementById("profile-username") as HTMLInputElement).value = userData.username;
		(document.getElementById("profile-codename") as HTMLInputElement).value = userData.codename;
		(document.getElementById("profile-email") as HTMLInputElement).value = userData.email;
		(document.getElementById("profile-bio") as HTMLInputElement).value = userData.biography;
		(document.getElementById('2fa-toggle') as HTMLInputElement).checked = userData.two_FA_status;
		if (userData.auth_method === 'google')
			(document.getElementById('2fa-toggle') as HTMLInputElement).disabled = true

		// Set user avatar
		renderProfileImage("profile-image", userData.username);
	} catch (error: any) {
		return lib.showToast.red(error.message);
	}
}

class Settings extends Page {
	constructor() {
		super("settings", '/settings');
	}
	onMount(): void {
		sidebar.setSidebarToggler('settings');

		// Set up the image selector
		document.getElementById('profile-image-button')?.addEventListener('click', async (e: Event) => {
			e.preventDefault();
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = 'image/*';
			input.addEventListener('change', async (event) => {
				const file = (event.target as HTMLInputElement).files?.[0];
				console.debug(file);
				if (file && (file.type.startsWith('image/png') || file.type.startsWith('image/jpeg') || file.type.startsWith('image/jpg'))) {
					if (file.size > 2 * 1024 * 1024) {
						lib.showToast.red("Image is too big. Max: 2MB");
						return;
					}

					// Saving the image on database
					try {
						const avatarFormData = new FormData();
						avatarFormData.append('image', file);

						const response = await fetch(`http://${location.hostname}:8080/api/users/update/avatar`, {
							method: 'PUT',
							credentials: "include",
							body: avatarFormData
						});
						if (!response.ok) {
							const errorData = await response.json();
							throw new Error(errorData.message);
						}

						(document.getElementById('profile-image') as HTMLImageElement).src = URL.createObjectURL(file);
						// cache image
						sessionStorage.setItem(`${lib.userInfo.username}-avatar`, await lib.convertBlobToBase64(file) as string);
						lib.showToast.green("Profile image updated successfully!");
					} catch (error: any) {
						return lib.showToast.red(error.message);
					}
				}
				else
					lib.showToast.red("Invalid image");
			});
			input.click();
		});

		// 2FA status button
		document.getElementById('2fa-toggle')!.addEventListener('click', async () => {
			const twoFAButton = document.getElementById('2fa-toggle') as HTMLInputElement;

			const userData: { two_FA_status: boolean } = {
				two_FA_status: twoFAButton.checked
			};
			try {
				const response = await fetch(`http://${location.hostname}:8080/2fa/set-google-authenticator`, {
					method: 'GET',
					credentials: "include",
				});
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message);
				}
				if (twoFAButton.checked) {
					const data = await response.json();
					document.getElementById('2fa-info')!.outerHTML = /*html*/`
						<div id="2fa-info" class="flex card pb-0 pt-2">
							<img id="qr-code-img" src="${data.content}" class="shadow-lg shadow-neutral-400 rounded"/>
							<div class="flex flex-col justify-center self-center gap-6 ml-20">
								<p>
									<b>To set up two factor authentication</b> <br>
									1. Download an authenticator app. <br>
									2. Scan the QR code. <br>
									3. Enter the 2FA code from the app, here.
								</p>
								<input type="text" id="qr-code-input" class="p-1 t-dashed pl-4 h-fit" placeholder="Enter 2FA code" maxlength="6" />
							</div>
						</div>
					`;
					document.getElementById('qr-code-input')!.addEventListener('input', async (event) => {
						const input = (event.target as HTMLInputElement);
						if (input.value.length === 6) {
							const payload : {totpCode :string; username: string} = {
								totpCode : input.value,
								username: lib.userInfo.username
							};
							const response2fa = await fetch(`http://${location.hostname}:8080/2fa/verify-google-authenticator`, {
								method: 'POST',
								credentials: "include",
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify(payload),
							});
							if (response.status === 401) throw new Error("Invalid Code.");

							if (!response2fa.ok) {
								const errorData = await response2fa.json();
								throw new Error(errorData.message);
							}
							lib.showToast(`Sent 2FA code: ${input.value}`);
							document.getElementById('2fa-info')?.remove();
						}
					});
					lib.showToast.green("2FA enabled");
				} else {
					document.getElementById('2fa-info')?.classList.add('hidden');
					lib.showToast.red("2FA disabled");
				}
			} catch (error: any) {
				console.log(error);
				return lib.showToast.red(error.message);
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

		loadInformation();
		this.saveProfileInformation();
		document.getElementById('profile-username')?.addEventListener('input', (e) => {
			const error = document.getElementById('username-error')!;
			if ((e.target as HTMLInputElement).validity.valid)
				error.classList.add('hidden');
			else
				error.classList.remove('hidden');
		});
		document.getElementById('refresh-color-button')?.addEventListener('click', () => {
			const randomColor = lib.colors[Math.floor(Math.random() * lib.colors.length)];
			lib.setColor(randomColor, true);
			(document.querySelector(`input[name="color"][value="${randomColor}"]`) as HTMLInputElement).checked = true;
		});
	}
	onCleanup(): void { }
	getHtml(): string {
		return /*html*/`
			${sidebar.getHtml()}
			<main class="grid grid-cols-2 max-2xl:grid-cols-1 flex-1 card t-dashed text-start overflow-auto">
				<div id="col-1">
					<form class="card flex flex-col overflow-auto py-0" action="#">
						<h1 class="item text-start text-2xl">Profile</h1>
						<div class="flex">
							<button id="profile-image-button" type="button" class="relative size-60 group">
								<img id="profile-image" class="rounded-full size-full object-cover border-2 shadow-lg shadow-neutral-400"/>
								<div class="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
									<i class="fa-solid fa-camera text-black dark:text-white"></i>
								</div>
							</button>
							<div class="flex flex-col justify-center self-center gap-4 ml-20">
								<label class="text-left font-bold" for="profile-username">Username</label>
								<input class="p-1 t-dashed pl-4 invalid:border-red-500" type="text" id="profile-username" placeholder="Enter username" value="User failed to load" minlength="3" maxlength="15" pattern="^[^<>]+$" required />
								<span id="username-error" class="text-red-500 text-xs hidden">Username has invalid length or characters</span>
								<label class="text-left font-bold" for="profile-codename">Codename</label>
								<input class="p-1 t-dashed pl-4" type="text" id="profile-codename" placeholder="Enter codename" value="Codename failed to load" required pattern="^[^<>]+$" />
								<label class="text-left font-bold" for="profile-email">Email</label>
								<input class="p-1 t-dashed pl-4" type="text" id="profile-email" placeholder="Enter email" value="Email failed to load" disabled minlength="5" pattern="^[^<>]+$"/>
							</div>
						</div>
						<label class="text-left font-bold" for="profile-bio">Biography</label>
						<textarea class="p-1 t-dashed pl-4" name="bio" id="profile-bio">Biography failed to load</textarea>
						<button class="item t-dashed" type="submit">Save</button>
					</form>
					<div class="flex flex-col item">
						<div class="flex justify-between item">
							<h1>2 Factor Authentication</h1>
							<label class="h-7 w-12">
								<input type="checkbox" class="sr-only peer" id="2fa-toggle">
								<div class="h-full relative t-dashed peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:start-0.5 peer-checked:after:bg-c-text dark:peer-checked:after:bg-c-bg after:size-5 after:bg-c-secondary dark:after:bg-c-primary after:transition-all after:rounded-full"></div>
							</label>
						</div>
						<div id="2fa-info" class="hidden card pb-0 pt-2"></div>
					</div>
				</div>
				<div class="flex flex-col">
					<div class="flex justify-between item items-center">
						<h1>Themes</h1>
						<ul class="flex t-dashed rounded-full p-1 gap-1">
							<li class="size-10">
								<input type="radio" id="auto-theme" name="theme" value="auto" class="hidden peer">
								<label for="auto-theme" class="flex size-full items-center justify-center rounded-full cursor-pointer peer-checked:bg-c-primary peer-checked:text-c-bg hover:bg-c-primary/70">
									<i class="fa-solid fa-desktop"></i>
								</label>
							</li>
							<li class="size-10">
								<input type="radio" id="light-theme" name="theme" value="light" class="hidden peer">
								<label for="light-theme" class="flex size-full items-center justify-center rounded-full cursor-pointer peer-checked:bg-c-primary peer-checked:text-c-bg hover:bg-c-primary/70">
									<i class="fa-solid fa-sun"></i>
								</label>
							</li>
							<li class="size-10">
								<input type="radio" id="dark-theme" name="theme" value="dark" class="hidden peer">
								<label for="dark-theme" class="flex size-full items-center justify-center rounded-full cursor-pointer peer-checked:bg-c-primary peer-checked:text-c-bg hover:bg-c-primary/70">
									<i class="fa-solid fa-moon"></i>
								</label>
							</li>
						</ul>
					</div>
					<div class="item flex flex-col items-start">
						<div class="flex gap-5">
							<h1>Color</h1>
							<button id="refresh-color-button" class="rounded-full size-7 hover:bg-c-primary/70">
								<i class="fa-solid fa-arrows-rotate"></i>
							</button>
						</div>
						<ul id="color-selector" class="mt-6 grid grid-cols-11 gap-4"></ul>
					</div>
				</div>
			</main>
		`;
	}
	saveProfileInformation() {
		const form = document.querySelector('form');
		const handler = async (e: Event) => {
			e.preventDefault();
			const userData: { username: string; codename: string; biography: string; } = {
				username: (document.getElementById('profile-username') as HTMLInputElement).value,
				codename: (document.getElementById('profile-codename') as HTMLInputElement).value,
				biography: (document.getElementById('profile-bio') as HTMLTextAreaElement).value,
			};
			try {
				const response = await fetch(`http://${location.hostname}:8080/api/users/save-settings`, {
					method: 'PUT',
					credentials: "include",
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(userData)
				});
				if (!response.ok) {
					const data = await response.json();
					throw new Error(data.message);
				}
				if (lib.userInfo.username !== userData.username)
				{
					turnOffChat();
					turnOnChat();
				}
				lib.userInfo.username = userData.username; 
				lib.userInfo.codename = userData.codename; 
				lib.userInfo.biography = userData.biography; 
				lib.showToast.green("Settings updated!");
			} catch (error: any) {
				return lib.showToast.red(error.message);
			}
		};
		form?.addEventListener('submit', handler);
		this.addCleanupHandler(() => form?.removeEventListener('submit', handler));
	}
}

const settings: Settings = new Settings();
export default settings;
