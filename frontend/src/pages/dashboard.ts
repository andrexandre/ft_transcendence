import Page from "./Page"
import * as lib from "../utils"
import sidebar from "../components/sidebar"
import { renderGameStatistics } from "./profile";

export interface MatchHistoryI {
	Mode: string;
	winner: {
		username: string;
		score: number;
	};
	loser: {
		username: string;
		score: number;
	};
	time: string;
}

function displayMatchHistory(matchHistory: MatchHistoryI[], requestedUsername: string) {
	const statsDiv = document.getElementById("stats-list")!;
	matchHistory.reverse().forEach(match => {
		const matchDiv = document.createElement("li");
		let matchBgColor = '';
		if (match.winner.username === requestedUsername)
			matchBgColor = "border-green-500 hover:border-green-700 dark:border-green-700 dark:hover:border-green-500";
		else if (match.loser.username === requestedUsername)
			matchBgColor = "border-red-500 hover:border-red-700 dark:border-red-700 dark:hover:border-red-500";
		matchDiv.className = "@container relative item t-dashed " + matchBgColor;
		matchDiv.innerHTML = /*html*/`
			<p class="text-sm absolute top-0 left-1/2 transform -translate-x-1/2">${match.Mode}</p>
			<div id="test" class="grid grid-cols-[auto_1fr_auto_1fr_auto] gap-4 text-2xl @xl:text-3xl pt-1 @xl:px-10">
				<p>${match.winner.score}</p>
				<p class="truncate">${match.winner.username}</p>
				<p class="text-c-secondary">vs</p>
				<p class="truncate">${match.loser.username}</p>
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

export async function updateMatchHistory(targetUsername: string) {
	try {
		const response = await fetch(`https://${location.hostname}:8080/game/${targetUsername}/user-game-history`, {
			credentials: "include",
		});
		if (!response.ok) {
			throw new Error(`${response.status} - ${response.statusText}`);
		}
		let matchHistory = await response.json();
		displayMatchHistory(matchHistory, targetUsername);
		if (lib.userInfo.path.startsWith("/profile/"))
			renderGameStatistics(matchHistory, targetUsername);
	} catch (error) {
		console.log(error);
		lib.showToast.red(error as string);
	}
}

export function renderDashboardFriend(friend: string, isOnline: boolean) {
	//* caching
	// if (document.getElementById(`profile-image-${friend}`)) {
	// 	const icon = document.getElementById(`${friend}-online-icon`)!;
	// 	icon.classList.remove(isOnline ? "text-neutral-500" : "text-green-600");
	// 	icon.classList.add(isOnline ? "text-green-600" : "text-neutral-500");
	// 	return;
	// }
	const friendsList = document.getElementById('friends-list')!;
	const friendsListEntry = document.createElement("li");
	friendsListEntry.className = "item t-dashed p-3 flex";
	friendsListEntry.innerHTML = /*html*/`
		<img id="profile-image-${friend}" class="size-10 object-cover rounded-4xl">
		<svg height="10" width="10" id="${friend}-online-icon" class="${isOnline ? "text-green-600" : "text-neutral-500"}"><circle cx="5" cy="5" r="5" fill="currentColor"/></svg>
		<h1 class="self-center ml-5">${friend}</h1>
	`;
	friendsListEntry.addEventListener('click', () => lib.navigate(`/chat/${friend}`), { once: true });
	friendsList.appendChild(friendsListEntry);
	renderProfileImage(`profile-image-${friend}`, friend);
}

export async function renderProfileImage(elementId: string, profileUsername: string) {
	// load image from cache
	if (sessionStorage.getItem(`${profileUsername}-avatar`) !== null) {
		(document.getElementById(elementId) as HTMLImageElement).src = sessionStorage.getItem(`${profileUsername}-avatar`) || 'https://picsum.photos/id/63/300';
		return;
	}
	try {
		const imageResponse = await fetch(`https://${location.hostname}:8080/api/users/${profileUsername}/avatar`, {
			credentials: 'include'
		})
		if (!imageResponse.ok) {
			const errorData = await imageResponse.json();
			throw new Error(errorData.message);
		}

		const blob = await imageResponse.blob();
		const url = URL.createObjectURL(blob);
		// cache image
		sessionStorage.setItem(`${profileUsername}-avatar`, await lib.convertBlobToBase64(blob) as string);
		(document.getElementById(elementId) as HTMLImageElement).src = url || 'https://picsum.photos/id/63/300';
		// URL.revokeObjectURL(url);
	} catch (error: any) {
		// When we have an error loadind the avatar we use this avatar as error
		(document.getElementById(elementId) as HTMLImageElement).src = 'https://picsum.photos/id/63/300';
		return lib.showToast.red(error.message);
	}
}

async function loadInformation() {
	try {
		const response = await fetch(`https://${location.hostname}:8080/api/users/settings`, {
			credentials: 'include'
		})
		if (!response.ok)
			throw new Error((await response.json()).message);

		// Set user information
		const userData = await response.json();
		(document.getElementById("profile-username") as HTMLElement).textContent = userData.username;
		(document.getElementById("profile-codename") as HTMLElement).textContent = userData.codename;
		(document.getElementById("profile-bio") as HTMLElement).textContent = userData.biography;

		renderProfileImage("profile-image", userData.username);
		updateMatchHistory(userData.username);
	} catch (error: any) {
		return lib.showToast.red(error.message);
	}
}

class Dashboard extends Page {
	reloadInterval: number | null = null;
	constructor() {
		super("dashboard", '/');
	}
	onMount(): void {
		sidebar.setSidebarToggler('home');
		document.getElementById("game-animation")!.addEventListener("click", () => lib.navigate('/game'), { once: true });
		loadInformation();
		document.getElementById("profile")!.addEventListener("click", () => lib.navigate('/profile'), { once: true });

		// Set dashboard friends
		if (lib.userInfo.chat_sock!.readyState === WebSocket.OPEN) {
			lib.userInfo.chat_sock!.send(JSON.stringify({ type: 'get-online-friends' }));
		} else {
			lib.userInfo.chat_sock!.addEventListener('open', () =>
				lib.userInfo.chat_sock!.send(JSON.stringify({ type: 'get-online-friends' })), { once: true });
		}
		this.reloadInterval = setInterval(function () {
			document.getElementById('friends-list')!.innerHTML = "";
			lib.userInfo.chat_sock!.send(JSON.stringify({
				type: 'get-online-friends'
			}));
		}, 5000);
	}
	onCleanup(): void {
		if (this.reloadInterval !== null) {
			clearInterval(this.reloadInterval);
			this.reloadInterval = null;
		}
	}
	getHtml(): string {
		return /*html*/`
			${sidebar.getHtml()}
			<main class="grid grid-cols-2 grid-rows-2 flex-1">
				<button id="profile" class="card t-dashed grid overflow-auto pl-15">
					<div class="flex items-center">
						<img id="profile-image" class="object-cover rounded-full size-48 shadow-xl shadow-neutral-400 border-2">
						<div class="ml-30 justify-center self-center">
							<h1 id="profile-username" class="text-3xl">User failed to load</h1>
							<p id="profile-codename" class="text-xl">Codename failed to load</p>
						</div>
					</div>
					<p id="profile-bio" class="max-w-3xl whitespace-pre-wrap text-start">Biography failed to load</p>
				</button>
				<button id="game-animation" class="card t-dashed relative p-0 flex justify-between group">
					<div id="red-paddle" class="left-0 bg-red-600 rounded h-20 w-5 self-center absolute animate-[paddle-animation_6s_infinite_linear]"></div>
					<div id="blue-paddle" class="right-0 bg-blue-700 rounded h-20 w-5 self-center absolute animate-[paddle-animation_6s_infinite_linear]"></div>
					<div class="ball size-4 rounded-xl bg-c-game-bg absolute animate-[ball-animation_6s_infinite_linear]"></div>
					<h1 class="self-center left-1/2 transform -translate-x-1/2 absolute text-7xl text-c-game-bg/70 transition-colors"
						style="animation: glow 2s infinite alternate; text-shadow: 0 0 10px green, 0 0 20px lime, 0 0 30px lime, 0 0 40px lime;">Let's Play</h1>
				</button>
				<div class="card t-dashed flex flex-col">
					<h1 class="text-xl">Pong match history</h1>
					<ul id="stats-list" class="flex flex-col gap-2 overflow-auto"></ul>
				</div>
				<div class="card t-dashed flex flex-col">
					<h1 class="text-xl">Friends</h1>
					<ul id="friends-list" class="flex flex-col gap-2 overflow-auto"></ul>
				</div>
			</main>
		`;
	}
}

const dashboard: Dashboard = new Dashboard();
export default dashboard;
