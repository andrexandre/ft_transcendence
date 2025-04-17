import Page from "./Page"
import * as lib from "../utils"
import sidebar from "../components/sidebar"

export async function renderProfileUsername() {
	const profileUsername = document.getElementById("profile-username")!;
	let line: string = '';
	if (lib.userInfo.username) {
		if (lib.userInfo.auth_method === "google")
			line = "G. ";
		else if (lib.userInfo.auth_method === "email")
			line = "E. ";
		profileUsername.textContent = line + lib.userInfo.username;
	}
	else
		profileUsername.textContent = "Sir Barkalot";
}

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
			<div class="flex justify-around text-3xl pt-1 items-center">
				<p>${match.winner.score}</p>
				<p>${match.winner.username}</p>
				<p>vs</p>
				<p>${match.loser.username}</p>
				<p>${match.loser.score}</p>
			</div>
		`;
		statsDiv.appendChild(matchDiv);
	});
}

async function updateMatchHistory() {
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
	}
}

async function getAndUpdateInfo() {
	try {
		const response = await fetch('http://127.0.0.1:7000/frontend/fetchDashboardData', {
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
		updateMatchHistory();
	} catch (error) {
		console.log(error);
		lib.showToast.red(error as string);
	}
}

class Dashboard extends Page {
	constructor() {
		super("dashboard", '/');
	}
	onMount(): void {
		sidebar.setSidebarToggler('home');
		document.getElementById("game-ad-button")!.addEventListener("click", () => lib.navigate('/game'));
		if (lib.userInfo.profileImage)
			(document.getElementById('profile-image') as HTMLImageElement).src = lib.userInfo.profileImage;
		getAndUpdateInfo();
	}
	onCleanup(): void { }
	getHtml(): string {
		return /*html*/`
			${sidebar.getHtml()}
			<main class="grid grid-cols-2 grid-rows-2 flex-1">
				<div id="profile" class="card t-dashed grid overflow-scroll">
					<div class="flex gap-16">
						<img id="profile-image" class="object-cover rounded-full size-48 shadow-xl shadow-neutral-400 border-2" src="https://picsum.photos/id/237/200">
						<div class="justify-center self-center">
							<h1 id="profile-username" class="text-3xl">Loading...</h1>
							<p id="profile-codename" class="text-xl">The mighty tail-wagger</p>
						</div>
					</div>
					<p id="profile-bio">Champion of belly rubs, fetch, and fierce squirrel chases. Sir Barkalot is the first to answer the doorbell with a royal bark. His hobbies include digging to China and chewing shoes.</p>
				</div>
				<div class="card t-dashed relative">
					<div class="ball size-4 rounded-xl bg-c-secondary absolute animate-[ball-animation_6s_infinite_linear]"></div>
					<button id="game-ad-button" class="flex p-5 t-dashed absolute bottom-0 animate-[btn-animation_6s_infinite_linear]">Let's Play</button>
				</div>
				<div class="card t-dashed flex flex-col">
					<h1 class="text-xl">Pong match history</h1>
					<ul id="stats-list" class="flex flex-col gap-2 overflow-scroll"></ul>
				</div>
				<div id="friends" class="card t-dashed flex flex-col justify-around overflow-scroll">
					<h1 class="text-xl">Active friends</h1>
					<ul id="friends-list" class="flex flex-col overflow-scroll">
						<li class="item t-dashed p-3 flex">
							<img src="https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Brian" class="size-10 rounded-4xl">
							<svg height="10" width="10"><circle cx="5" cy="5" r="5" fill="green" /></svg>
							<h1 class="self-center ml-5">Brian</h1>
						</li>
						<li class="item t-dashed p-3 flex">
							<img src="https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Eliza" class="size-10 rounded-4xl">
							<svg height="10" width="10"><circle cx="5" cy="5" r="5" fill="grey" /></svg>
							<h1 class="self-center ml-5">Eliza</h1>
						</li>
						<li class="item t-dashed p-3 flex">
							<img src="https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Alexander" class="size-10 rounded-4xl">
							<svg height="10" width="10"><circle cx="5" cy="5" r="5" fill="grey" /></svg>
							<h1 class="self-center ml-5">Alexander</h1>
						</li>
					</ul>
				</div>
			</main>
		`
	}
}

const dashboard: Dashboard = new Dashboard();
export default dashboard;
