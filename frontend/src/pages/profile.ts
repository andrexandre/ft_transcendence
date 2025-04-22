import Page from "./Page"
import * as lib from "../utils"
import sidebar from "../components/sidebar"
import { MatchHistoryI } from "./dashboard";

function displayMatchHistory(matchHistory: MatchHistoryI[]) {
	const statsDiv = document.getElementById("stats-list")!;
	matchHistory.forEach(match => {
		const matchDiv = document.createElement("li");
		let matchBgColor = '';
		if (match.winner.username === lib.userInfo.username)
			matchBgColor = "border-green-500 hover:border-green-700 dark:border-green-700 dark:hover:border-green-500";
		else if (match.loser.username === lib.userInfo.username)
			matchBgColor = "border-red-500 hover:border-red-700 dark:border-red-700 dark:hover:border-red-500";
		matchDiv.className = "relative item t-dashed " + matchBgColor;
		matchDiv.innerHTML = /*html*/`
			<p class="text-sm absolute top-0 left-1/2 transform -translate-x-1/2">${match.Mode}</p>
			<div class="flex justify-around text-xl pt-1 items-center">
				<p>${match.winner.score}</p>
				<p>${match.winner.username}</p>
				<p>vs</p>
				<p>${match.loser.username}</p>
				<p>${match.loser.score}</p>
			</div>
		`;
		statsDiv.appendChild(matchDiv);
	});
	if (matchHistory.length === 0) {
		statsDiv.innerHTML = /*html*/`
			<li class="item text-c-secondary">Empty match history</li>
		`;
	}
}

export async function updateMatchHistory() {
	try {
		const response = await fetch('http://127.0.0.1:5000/user-game-history', {
			credentials: "include",
		});
		if (!response.ok) {
			throw new Error(`${response.status} - ${response.statusText}`);
		}
		let matchHistory = await response.json();
		displayMatchHistory(matchHistory);
	} catch (error) {
		console.log(error);
		lib.showToast.red(error as string);
		document.getElementById("stats-list")!.innerHTML = /*html*/`
			<li class="item text-c-secondary">Invalid match history</li>
		`;
	}
}

async function loadInformation() {
	const response = await fetch('http://127.0.0.1:3000/api/user/settings', {
		credentials: 'include'
	})
	if (!response.ok) return lib.showToast.red('Failed to load user Information!');
	
	// Set user information
	const userData = await response.json();
	(document.getElementById("profile-username") as HTMLInputElement).value = userData.username;
	(document.getElementById("profile-codename") as HTMLInputElement).value = userData.codename;
	(document.getElementById("profile-email") as HTMLInputElement).value = userData.email;
	
	if (userData.auth_method === 'google') // Google sign people can not change the email
		(document.getElementById("profile-email") as HTMLInputElement).disabled	 = true;

	(document.getElementById("profile-bio") as HTMLInputElement).value = userData.biography;

	// Set user avatar
	const imageResponse = await fetch('http://127.0.0.1:3000/api/user/avatar', {
		credentials: 'include'
	})
	if (!imageResponse.ok) return lib.showToast.red('Failed to load user Avatar!');

	const blob = await imageResponse.blob();
	console.log(blob);
	const url = URL.createObjectURL(blob);
	(document.getElementById("profile-image") as HTMLImageElement).src = url || 'https://picsum.photos/id/63/300';
}

class Profile extends Page {
	constructor() {
		super("profile", '/profile');
	}
	onMount(): void {
		// Set up the image selector
		// if (lib.userInfo.profileImage)
		// 	(document.getElementById('profile-image') as HTMLImageElement).src = lib.userInfo.profileImage;
		document.getElementById('profile-image-button')?.addEventListener('click', async (e: Event) => {
			e.preventDefault();
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = 'image/*';
			input.addEventListener('change', async (event) => {
				const file = (event.target as HTMLInputElement).files?.[0];
				console.log(file);
				if (file && file.type.startsWith('image/')) {
					const reader = new FileReader();
					reader.onload = () => {
						lib.userInfo.profileImage = reader.result as string;
						const profileImage = document.getElementById('profile-image') as HTMLImageElement;
						profileImage.src = lib.userInfo.profileImage;
						lib.showToast.green("Profile image updated successfully!");
					};
					reader.readAsDataURL(file);

					// Saving the image on dataBase
					try {
						const avatarFormData = new FormData();
						avatarFormData.append('image', file);

						const response = await fetch('http://127.0.0.1:3000/api/user/update/avatar', {
							method: 'POST',
							credentials: "include",
							body: avatarFormData
						});
						if (!response.ok)
							throw new Error(`${response.status} - ${response.statusText}`);

						lib.showToast.green("Imagem salva no servidor!");
					} catch (err) {
						console.error("Erro ao enviar imagem:", err);
						lib.showToast.red("Erro ao salvar a imagem no servidor.");
					}
				} else
					lib.showToast.red("Invalid file type. Please select an image.");
			});
			input.click();
		});

		// It's not working, but it's a good idea
		// document.addEventListener('click', (event: MouseEvent) => {
		// 	const dialogDimensions = document.getElementById('profile-dialog')?.getBoundingClientRect();
		// 	const isBackdropClick =
		// 		event.clientX < dialogDimensions!.left ||
		// 		event.clientX > dialogDimensions!.right ||
		// 		event.clientY < dialogDimensions!.top ||
		// 		event.clientY > dialogDimensions!.bottom;
			
		// 	if (isBackdropClick) {
		// 		window.history.back();
		// 	}
		// });
		(document.getElementById('profile-dialog') as HTMLDialogElement).addEventListener('close', () => window.history.back());
		loadInformation();
		updateMatchHistory();
		this.saveProfileInformation();
	}
	onCleanup(): void {}
	getHtml(): string {
		return /*html*/`
			<main class="grid flex-1 card items-center justify-center">
				<dialog open id="profile-dialog" class="flex  gap-5 bg-c-text/75 fixed top-1/2 left-1/2 -translate-1/2 rounded-4xl p-6 w-fit shadow-lg backdrop:bg-blue-500/50">
					<div class="t-dashed flex">
						<form id="profile" class="card flex flex-col overflow-auto" action="#">
							<h1 class="item text-start text-2xl">Profile</h1>
							<div class="flex">
								<button id="profile-image-button" class="relative size-60 group">
									<img id="profile-image" class="rounded-full size-full object-cover border-2 shadow-lg shadow-neutral-400"/>
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
					</div>
					<div class="t-dashed flex">
						<div class="card flex flex-col w-70 pt-15 px-0">
							<h1 class="text-xl">Pong match history</h1>
							<ul id="stats-list" class="flex flex-col gap-2 overflow-auto"></ul>
						</div>
						<form method="dialog" action="#">
							<button class="top-13 right-13 absolute">
								<i class="fa-solid fa-xmark fa-xl text-c-primary hover:text-c-secondary"></i>
							</button>
						</form>
					</div>
				</dialog>
			</main>
		`;
	}
	saveProfileInformation() {
		const form = document.getElementById('profile') as HTMLFormElement;
		const handler = async (e: Event) => {
			e.preventDefault();
			const userData: { username: string; codename: string; email: string; biography: string } = {
				username: (document.getElementById('profile-username') as HTMLInputElement).value,
				codename: (document.getElementById('profile-codename') as HTMLInputElement).value,
				email: (document.getElementById('profile-email') as HTMLInputElement).value,
				biography: (document.getElementById('profile-bio') as HTMLTextAreaElement).value
			};
			try {
				const response = await fetch('http://127.0.0.1:3000/api/users/save-settings', {
					method: 'POST',
					credentials: "include",
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(userData)
				});
				if (!response.ok) {
					throw new Error(`${response.status} - ${response.statusText}`);
				}
				lib.showToast.green("Updated!");
			} catch (error) {
				console.log(error);
				lib.showToast.red(error as string);
			}
		};
		form?.addEventListener('submit', handler);
		this.addCleanupHandler(() => form?.removeEventListener('submit', handler));
	}
}

const profile: Profile = new Profile();
export default profile;
