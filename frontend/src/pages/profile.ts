import Page from "./Page"
import * as lib from "../utils"
import sidebar from "../components/sidebar"
import { renderProfileImage, updateMatchHistory } from "./dashboard";

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
				<dialog open id="profile-dialog" class="h-130 grid grid-cols-1 lg:grid-cols-[560px_500px] grid-rows-2 lg:grid-rows-1 gap-5 bg-c-bg/75 dark:bg-c-text/25 dark:text-c-bg fixed top-1/2 left-1/2 -translate-1/2 rounded-4xl p-6 w-fit shadow-lg overflow-scroll">
					<div class="card t-dashed grid overflow-auto gap-10">
						<div class="flex gap-16">
							<img id="profile-image" class="object-cover rounded-full size-48 shadow-xl shadow-neutral-400 border-2">
							<div class="justify-center self-center">
								<h1 id="profile-username" class="text-3xl">User failed to load</h1>
								<p id="profile-codename" class="text-xl">Codename failed to load</p>
							</div>
						</div>
						<p id="profile-bio" class="min-w-md max-w-3xl whitespace-pre-wrap text-start">Biography failed to load</p>
					</div>
					<div class="t-dashed flex card gap-0 px-5">
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
				</dialog>
			</main>
		`;
	}
}

const profile: Profile = new Profile();
export default profile;
