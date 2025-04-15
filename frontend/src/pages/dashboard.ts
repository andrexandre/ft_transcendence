import Page from "./Page"
import * as lib from "../utils"
import sidebar from "../components/sidebar"

export async function renderProfileUsername() {
	const profileUsername = document.getElementById("profile-username")!;
	if (!lib.userInfo.username)
		await new Promise(r => setTimeout(r, 100));
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
	const statsDiv = document.getElementById("stats")!;
	matchHistory.forEach(match => {
		const matchDiv = document.createElement("div");
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

class Dashboard extends Page {
	constructor() {
		super("dashboard", '/');
	}
	onMount(): void {
		sidebar.setSidebarToggler('home');
		renderProfileUsername();
		document.getElementById("game-ad-button")!.addEventListener("click", () => lib.navigate('/game'));
		(async () => {
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
		})();
	}
	onCleanup(): void { }
	getHtml(): string {
		return /*html*/`
			${sidebar.getHtml()}
			<main class="grid grid-cols-2 grid-rows-2 flex-1">
				<div id="profile" class="card t-dashed grid overflow-scroll">
					<div class="flex gap-16">
						<img class="rounded-full size-48 shadow-xl shadow-neutral-400 border-2" src="https://picsum.photos/id/237/200">
						<div class="justify-center self-center">
							<h1 id="profile-username" class="text-3xl">Loading...</h1>
							<p class="text-xl">The mighty tail-wagger</p>
						</div>
					</div>
					<p>Champion of belly rubs, fetch, and fierce squirrel chases. Sir Barkalot is the first to answer the doorbell with a royal bark. His hobbies include digging to China and chewing shoes.</p>
				</div>
				<div class="card t-dashed relative">
					<div class="ball size-4 rounded-xl bg-c-secondary absolute animate-[ball-animation_6s_infinite_linear]"></div>
					<button id="game-ad-button" class="flex p-5 t-dashed absolute bottom-0 animate-[btn-animation_6s_infinite_linear]">Let's Play</button>
				</div>
				<div id="stats" class="card t-dashed flex flex-col overflow-scroll">
					<h1 class="text-xl">Pong match history</h1>
				</div>
				<div id="friends" class="card t-dashed flex flex-col justify-around overflow-scroll">
					<h1 class="text-xl">Active friends</h1>
					<div class="item t-dashed p-3 flex">
						<img src="https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Brian" class="size-10 rounded-4xl">
						<svg height="10" width="10"><circle cx="5" cy="5" r="5" fill="green" /></svg>
						<h1 class="self-center ml-5">Brian</h1>
					</div>
					<div class="item t-dashed p-3 flex">
						<img src="https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Eliza" class="size-10 rounded-4xl">
						<svg height="10" width="10"><circle cx="5" cy="5" r="5" fill="grey" /></svg>
						<h1 class="self-center ml-5">Eliza</h1>
					</div>
					<div class="item t-dashed p-3 flex">
						<img src="https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Alexander" class="size-10 rounded-4xl">
						<svg height="10" width="10"><circle cx="5" cy="5" r="5" fill="grey" /></svg>
						<h1 class="self-center ml-5">Alexander</h1>
					</div>
				</div>
			</main>
		`
	}
}

const dashboard: Dashboard = new Dashboard();
export default dashboard;
