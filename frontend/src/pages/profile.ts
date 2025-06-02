import Page from "./Page"
import * as lib from "../utils"
import sidebar from "../components/sidebar"
import { renderProfileImage, updateMatchHistory, MatchHistoryI } from "./dashboard";

export function renderGameStatistics(history: MatchHistoryI[], profileUsername: string) {

	const wins = history.filter(match => match.winner.username === profileUsername);
	const losses = history.filter(match => match.loser.username === profileUsername);

	function calculate(type: string, obj: MatchHistoryI[]) {
		return obj.filter(match => match.Mode === type).length
	}
	document.getElementById('pong-stats')!.innerHTML = /*html*/`
		<div>
			<p class="invisible">Pong stats</p>
			<p>1v1</p>
			<p>classic</p>
			<p>tournament</p>
			<p>matrecos</p>
		</div>
		<div>
			<p><i class="fa-solid fa-trophy"></i></p>
			<p>${calculate('1V1', wins)}</p>
			<p>${calculate('Classic', wins)}</p>
			<p>${calculate('TNT', wins)}</p>
			<p>${calculate('MTC', wins)}</p>
		</div>
		<div>
			<p><i class="fa-solid fa-skull"></i></p>
			<p>${calculate('1V1', losses)}</p>
			<p>${calculate('Classic', losses)}</p>
			<p>${calculate('TNT', losses)}</p>
			<p>${calculate('MTC', losses)}</p>
		</div>
	`
}

async function loadInformation(profileUsername: string) {
	try {
		const response = await fetch(`http://${location.hostname}:8080/api/users/${profileUsername}/info`, {
			credentials: 'include'
		})
		if (!response.ok) {
			window.history.replaceState({}, '', '/profile');
			lib.navigate('/profile');
			return lib.showToast.red('Failed to load user Information!');
		}
		// Set user information
		const userData = await response.json();
		(document.getElementById("profile-username") as HTMLElement).textContent = userData.username;
		(document.getElementById("profile-codename") as HTMLElement).textContent = userData.codename;
		(document.getElementById("profile-bio") as HTMLElement).textContent = userData.biography;

		renderProfileImage("profile-image", profileUsername);
		updateMatchHistory(profileUsername);
	} catch (error: any) {
		return lib.showToast.red(error.message);
	}
}

class Profile extends Page {
	constructor() {
		super("profile", '/profile');
	}
	onMount(): void {
		document.addEventListener('click', (event: MouseEvent) => {
			const dialogDimensions = document.getElementById('profile-dialog')?.getBoundingClientRect();
			if (!dialogDimensions)
				return;
			const isBackdropClick =
				event.clientX < dialogDimensions!.left ||
				event.clientX > dialogDimensions!.right ||
				event.clientY < dialogDimensions!.top ||
				event.clientY > dialogDimensions!.bottom;

			if (isBackdropClick) {
				(document.getElementById('profile-dialog') as HTMLDialogElement).close();
			}
		});
		(document.getElementById('profile-dialog') as HTMLDialogElement).addEventListener('close', () => {
			if (window.history.length > 1)
				window.history.back();
			else
				lib.navigate('/');
		});
		if (lib.userInfo.path == '/profile' || lib.userInfo.path == '/profile/') {
			lib.userInfo.path = '/profile/' + lib.userInfo.username;
			window.history.replaceState({}, '', lib.userInfo.path);
		}
		loadInformation(lib.userInfo.path.split('/profile/')[1]);
	}
	onCleanup(): void { }
	getHtml(): string {
		return /*html*/`
			<main class="grid flex-1 card items-center justify-center">
				<dialog open id="profile-dialog" class="h-150 grid grid-cols-1 lg:grid-cols-[560px_500px] grid-rows-2 lg:grid-rows-[2fr_1fr] gap-5 bg-black/7 dark:bg-white/7 text-c-text dark:text-c-bg fixed top-1/2 left-1/2 -translate-1/2 rounded-4xl p-6 w-fit shadow-lg">
					<div class="card t-dashed grid overflow-auto">
						<div class="flex gap-16">
							<img id="profile-image" class="object-cover rounded-full size-40 shadow-xl shadow-neutral-400 border-2">
							<div class="justify-center self-center">
								<h1 id="profile-username" class="text-3xl">User failed to load</h1>
								<p id="profile-codename" class="text-xl">Codename failed to load</p>
							</div>
						</div>
						<p id="profile-bio" class="whitespace-pre-wrap text-start">Biography failed to load</p>
					</div>
					<div class="card t-dashed flex gap-0 px-5 row-span-2">
						<div class="flex flex-col w-full gap-5">
							<h1 class="text-xl">Pong match history</h1>
							<ul id="stats-list" class="flex flex-col gap-2 overflow-auto"></ul>
						</div>
						<form method="dialog" action="#">
							<button class="top-13 right-13 absolute">
								<i class="fa-solid fa-xmark fa-xl text-c-primary hover:text-c-secondary"></i>
							</button>
						</form>
					</div>
					<div id="pong-stats" class="card t-dashed flex justify-around py-5 text-xl"></div>
				</dialog>
			</main>
		`;
	}
}

const profile: Profile = new Profile();
export default profile;
