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
			<div class="grid grid-cols-[1rem_1fr_1rem_1fr_1rem] text-xl pt-1">
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
		const response = await fetch(`http://${location.hostname}:5000/user-game-history`, {
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

async function loadInformation(profileUsername: string) {
	const response = await fetch(`http://${location.hostname}:3000/api/users/${profileUsername}`, {
		credentials: 'include'
	})
	if (!response.ok) return lib.showToast.red('Failed to load user Information!');
	// Set user information
	const userData = await response.json();
	(document.getElementById("profile-username") as HTMLElement).textContent = userData.username;
	(document.getElementById("profile-codename") as HTMLElement).textContent = userData.codename;
	(document.getElementById("profile-bio") as HTMLElement).textContent = userData.biography;
	lib.userInfo.username = userData.username;

	// Set user avatar
	const imageResponse = await fetch(`http://${location.hostname}:3000/api/users/${profileUsername}/avatar`, {
		credentials: 'include'
	})
	if (!imageResponse.ok) return lib.showToast.red('Failed to load user Avatar!');

	const blob = await imageResponse.blob();
	console.log(blob);
	const url = URL.createObjectURL(blob);
	(document.getElementById("profile-image") as HTMLImageElement).src = url || 'https://picsum.photos/id/63/300';
	updateMatchHistory();
}

class Profile extends Page {
	constructor() {
		super("profile", '/profile');
	}
	onMount(): void {
		// if (lib.userInfo.profileImage)
		// 	(document.getElementById('profile-image') as HTMLImageElement).src = lib.userInfo.profileImage;
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
		if (lib.userInfo.path == '/profile' || lib.userInfo.path == '/profile/')
			lib.userInfo.path = '/profile/' + lib.userInfo.username;
		loadInformation(lib.userInfo.path.split('/profile/')[1]);
		this.saveProfileInformation();
	}
	onCleanup(): void { }
	getHtml(): string {
		return /*html*/`
			<main class="grid flex-1 card items-center justify-center">
				<dialog open id="profile-dialog" class="flex gap-5 bg-c-bg/75 dark:bg-c-text/25 dark:text-c-bg fixed top-1/2 left-1/2 -translate-1/2 rounded-4xl p-6 w-fit shadow-lg">
					<div class="card t-dashed grid overflow-auto gap-10">
						<div class="flex gap-16">
							<img id="profile-image" class="object-cover rounded-full size-48 shadow-xl shadow-neutral-400 border-2" src="https://picsum.photos/id/237/200">
							<div class="justify-center self-center">
								<h1 id="profile-username" class="text-3xl">Sir Barkalot</h1>
								<p id="profile-codename" class="text-xl">The mighty tail-wagger</p>
							</div>
						</div>
						<p id="profile-bio" class="h-30 min-w-md max-w-3xl whitespace-pre-wrap text-start">Champion of belly rubs, fetch, and fierce squirrel chases. Sir Barkalot is the first to answer the doorbell with a royal bark. His hobbies include digging to China and chewing shoes.</p>
					</div>
					<div class="t-dashed flex card gap-0 px-5">
						<div class="flex flex-col w-60 gap-5">
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
				const response = await fetch(`http://${location.hostname}:3000/api/users/save-settings`, {
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
