import Page from "./Page"
import * as lib from "../utils"
import sidebar from "../components/sidebar"

// async function getAndUpdateInfo() {
// 	try {
// 		const response = await fetch(`http://${location.hostname}:7000/fetchDashboardData`, {
// 			credentials: 'include',
// 		});
// 		if (!response.ok) {
// 			lib.navigate('/login');
// 			throw new Error(`${response.status} - ${response.statusText}`);
// 		}
// 		let dashData = await response.json();
// 		lib.userInfo.username = dashData.username;
// 		lib.userInfo.codename = dashData.codename;
// 		lib.userInfo.biography = dashData.biography;
// 		lib.userInfo.userId = dashData.userId;
// 		lib.userInfo.auth_method = dashData.auth_method;
// 		document.getElementById("profile-username")!.textContent = dashData.username;
// 		updateMatchHistory();
// 	} catch (error) {
// 		console.log(error);
// 		lib.showToast.red(error as string);
// 	}
// }

interface MatchHistoryI {
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

function displayMatchHistory(matchHistory: MatchHistoryI[]) {
	const statsDiv = document.getElementById("stats-list")!;
	matchHistory.reverse().forEach(match => {
		const matchDiv = document.createElement("li");
		let matchBgColor = '';
		if (match.winner.username === lib.userInfo.username)
			matchBgColor = "border-green-500 hover:border-green-700 dark:border-green-700 dark:hover:border-green-500";
		else if (match.loser.username === lib.userInfo.username)
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
		// lib.showToast.red(error as string); //* TEMP
		document.getElementById("stats-list")!.innerHTML = /*html*/`
			<li class="item text-c-secondary">Invalid match history</li>
		`;
	}
}

export function renderDashboardFriend(friend: string, isOnline: boolean) {
	const friendsList = document.getElementById('friends-list')!;
	const friendsListEntry = document.createElement("li");
	friendsListEntry.className = "item t-dashed p-3 flex";
	friendsListEntry.innerHTML = /*html*/`
		<img id="profile-image-${friend}" src="https://picsum.photos/id/63/40" class="size-10 rounded-4xl">
		<svg height="10" width="10"><circle cx="5" cy="5" r="5" fill="currentColor" class="${isOnline ? "text-green-600" : "text-neutral-600"}"/></svg>
		<h1 class="self-center ml-5">${friend}</h1>
	`;
	friendsListEntry.addEventListener('click', () => lib.navigate(`/chat/${friend}`));
	friendsList.appendChild(friendsListEntry);
	setProfileImage(`profile-image-${friend}`, friend);
}

export async function setProfileImage(elementId: string, profileUsername?: string) {
	let imageUrl = `http://${location.hostname}:8080/api/users/avatar`
	if (profileUsername)
		imageUrl = `http://${location.hostname}:8080/api/users/${profileUsername}/avatar`

	try {
		const imageResponse = await fetch(imageUrl, {
			credentials: 'include'
		})
		if (!imageResponse.ok) {
			const errorData = await imageResponse.json();
			throw new Error(errorData.message);
		}
	
		const blob = await imageResponse.blob();
		const url = URL.createObjectURL(blob);
		
		(document.getElementById(elementId) as HTMLImageElement).src = url || 'https://picsum.photos/id/63/300';
		// URL.revokeObjectURL(url);
		// lib.userInfo.profileImage = url;
	} catch (error: any) {
		// When we have an error loadind the avatar we use this avatar as error
		(document.getElementById(elementId) as HTMLImageElement).src = 'https://picsum.photos/id/63/300';
		return lib.showToast.red(error.message);
	}
}

async function loadInformation() {

	try {
		const response = await fetch(`http://${location.hostname}:8080/api/users/settings`, {
			credentials: 'include'
		})
		if (!response.ok)
			throw new Error((await response.json()).message);
		// Set user information
		const userData = await response.json();
		(document.getElementById("profile-username") as HTMLElement).textContent = userData.username;
		(document.getElementById("profile-codename") as HTMLElement).textContent = userData.codename;
		(document.getElementById("profile-bio") as HTMLElement).textContent = userData.biography;
		lib.userInfo.username = userData.username;
		// lib.userInfo.codename = userData.codename;
		// lib.userInfo.biography = userData.biography;
		// lib.userInfo.userId = userData.userId;
		// lib.userInfo.auth_method = userData.auth_method;
	
		setProfileImage("profile-image");
		updateMatchHistory();
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
		document.getElementById("game-ad-button")!.addEventListener("click", () => lib.navigate('/game'));
		// if (lib.userInfo.profileImage)
		// 	(document.getElementById('profile-image') as HTMLImageElement).src = lib.userInfo.profileImage;
		loadInformation();
		document.getElementById("profile")!.addEventListener("click", () => lib.navigate('/profile'));

		// Set dashboard friends
		if (lib.userInfo.chat_sock!.readyState === WebSocket.OPEN) {
			lib.userInfo.chat_sock!.send(JSON.stringify({ type: 'get-online-friends' }));
		} else {
			const onChatSocketOpen = () => {
				lib.userInfo.chat_sock!.removeEventListener('open', onChatSocketOpen);
				lib.userInfo.chat_sock!.send(JSON.stringify({ type: 'get-online-friends' }));
			};
			lib.userInfo.chat_sock!.addEventListener('open', onChatSocketOpen);
		}
		this.reloadInterval = setInterval(() => {
			document.getElementById('friends-list')!.innerHTML = '';
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
				<button id="profile" class="card t-dashed grid overflow-auto">
					<div class="flex gap-16">
						<img id="profile-image" class="object-cover rounded-full size-48 shadow-xl shadow-neutral-400 border-2" src="https://picsum.photos/id/63/200">
						<div class="justify-center self-center">
							<h1 id="profile-username" class="text-3xl">Sir Barkalot</h1>
							<p id="profile-codename" class="text-xl">The mighty tail-wagger</p>
						</div>
					</div>
					<p id="profile-bio" class="max-w-3xl whitespace-pre-wrap text-start">Champion of belly rubs, fetch, and fierce squirrel chases. Sir Barkalot is the first to answer the doorbell with a royal bark. His hobbies include digging to China and chewing shoes.</p>
				</button>
				<div class="card t-dashed relative">
					<div class="ball size-4 rounded-xl bg-c-secondary absolute animate-[ball-animation_6s_infinite_linear]"></div>
					<button id="game-ad-button" class="flex p-5 t-dashed absolute bottom-0 animate-[btn-animation_6s_infinite_linear]">Let's Play</button>
				</div>
				<div class="card t-dashed flex flex-col">
					<h1 class="text-xl">Pong match history</h1>
					<ul id="stats-list" class="flex flex-col gap-2 overflow-auto"></ul>
				</div>
				<div class="card t-dashed flex flex-col">
					<h1 class="text-xl">Online friends WIP</h1>
					<ul id="friends-list" class="flex flex-col gap-2 overflow-auto"></ul>
				</div>
			</main>
		`
	}
}

const dashboard: Dashboard = new Dashboard();
export default dashboard;
