import Page from "./Page"
import * as lib from "../utils"
import sidebar from "../components/sidebar"

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
			<div class="grid grid-cols-[5rem_1fr_5rem_1fr_5rem] text-3xl pt-1">
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

async function updateMatchHistory() {
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

async function getAndUpdateInfo() {
	try {
		const response = await fetch(`http://${location.hostname}:7000/fetchDashboardData`, {
			credentials: 'include',
		});
		if (!response.ok) {
			lib.navigate('/login');
			throw new Error(`${response.status} - ${response.statusText}`);
		}
		let dashData = await response.json();
		lib.userInfo.username = dashData.username;
		lib.userInfo.codename = dashData.codename;
		lib.userInfo.biography = dashData.biography;
		lib.userInfo.userId = dashData.userId;
		lib.userInfo.auth_method = dashData.auth_method;
		document.getElementById("profile-username")!.textContent = dashData.username;
		updateMatchHistory();
	} catch (error) {
		console.log(error);
		lib.showToast.red(error as string);
	}
}

async function loadInformation() {
	const response = await fetch(`http://${location.hostname}:3000/api/users/settings`, {
		credentials: 'include'
	})
	if (!response.ok) return lib.showToast.red('Failed to load user Information!');
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

	// Set user avatar
	const imageResponse = await fetch(`http://${location.hostname}:3000/api/users/avatar`, {
		credentials: 'include'
	})
	if (!imageResponse.ok) return lib.showToast.red('Failed to load user Avatar!');

	const blob = await imageResponse.blob();
	// console.log(blob);
	const url = URL.createObjectURL(blob);
	(document.getElementById("profile-image") as HTMLImageElement).src = url || 'https://picsum.photos/id/63/300';
	updateMatchHistory();
}

class Dashboard extends Page {
	constructor() {
		super("dashboard", '/');
	}
	onMount(): void {
		sidebar.setSidebarToggler('home');
		document.getElementById("game-ad-button")!.addEventListener("click", () => lib.navigate('/game'));
		// if (lib.userInfo.profileImage)
		// 	(document.getElementById('profile-image') as HTMLImageElement).src = lib.userInfo.profileImage;
		// getAndUpdateInfo();
		loadInformation();
		document.getElementById("profile")!.addEventListener("click", () => lib.navigate('/profile'));
		lib.userInfo.chat_sock!.send(JSON.stringify({
			type: 'get-friends-list'
		}));
	}
	onCleanup(): void { }
	getHtml(): string {
		return /*html*/`
			${sidebar.getHtml()}
			<main class="grid grid-cols-2 grid-rows-2 flex-1">
				<button id="profile" class="card t-dashed grid overflow-auto">
					<div class="flex gap-16">
						<img id="profile-image" class="object-cover rounded-full size-48 shadow-xl shadow-neutral-400 border-2" src="https://picsum.photos/id/237/200">
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
					<h1 class="text-xl">Active friends</h1>
					<ul id="friends-list" class="flex flex-col gap-2 overflow-auto"></ul>
				</div>
			</main>
		`
	}
}

const dashboard: Dashboard = new Dashboard();
export default dashboard;
