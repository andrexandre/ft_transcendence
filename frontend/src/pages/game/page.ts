import Page from "../Page"
import * as lib from "../../utils"
import sidebar from "../../components/sidebar"
import dropdown from "../../components/dropdown"
import * as menu from "./menu"
import * as logic from "./single"
import { startMultiplayerClient } from "./client"


//* TEMP
let lobbyid = 0;
let rmlobbyid = 0;

function initializeGameMainMenu(page: Game) {
	// Set Single dropdown
	dropdown.initialize('Single');
	const username = sessionStorage.getItem("username");
	if (!username) {
		console.error("❌ No username found in sessionStorage!");
		dropdown.addElement('Single', 'button', 'item t-border',
			'User not found');
	}
	else {
		dropdown.addElement('Single', 'button', 'item t-border',
			'Classic', () => {
				const difficulty = sessionStorage.getItem("user_set_dificulty") || "Normal";
				const tableSize = sessionStorage.getItem("user_set_tableSize") || "Medium";
				const sound = sessionStorage.getItem("user_set_sound") === "1";
				document.getElementById('sidebar')?.classList.toggle('hidden');
				logic.startSingleClassic(username, { difficulty, tableSize, sound })
			});
	}
	dropdown.addElement('Single', 'button', 'item t-border',
		'Infinity', () => lib.showToast(`Single Infinity clicked`));

	// Set Multi dropdown
	dropdown.initialize('Multi', () => {
		const lobby = document.getElementById('lobby');
		lobby?.classList.toggle('hidden');
	});
	dropdown.addElement('Multi', 'button', 'item t-border', 'Tournament',
		() => {
			//* TEMP
			page.addLobbyEntry(lobbyid.toString(), 'me', 'multi', "5");
			lobbyid++;
		});
	dropdown.addElement('Multi', 'button', 'item t-border', "Don't click",
		() => {
			//* TEMP
			page.removeLobbyEntry(rmlobbyid.toString());
			rmlobbyid++;
		});
	// * TEMP
	// document.getElementById('dropdownButton-Multi')?.click();
	// this.addLobbyEntry(lobbyid.toString(), 'me', 'multi', "5");

	// Set Co-Op dropdown
	dropdown.initialize('Co-Op');
	dropdown.addElement('Co-Op', 'button', 'item t-border', 'Soccer',
		() => {
			lib.showToast("Connecting to multiplayer game...");
			startMultiplayerClient();
		});
	dropdown.addElement('Co-Op', 'button', 'item t-border', 'Don\'t click',
		() => lib.showToast(`Co-Op Don't click clicked`));
}

class Game extends Page {
	constructor() {
		super("game", '/game');
	}
	onMount(): void {
		sidebar.setSidebarToggler();
		// Set Settings dropdown
		dropdown.initialize('Settings');
		dropdown.addElement('Settings', 'div', 'flex flex-col', /*html*/`
			<div class="grid grid-cols-[1fr_2fr] items-center">
				<label for="difficulty">Difficulty</label>
				<select id="difficulty" class="item t-border justify-center">
					<option>Easy</option>
					<option>Normal</option>
					<option>Hard</option>
				</select>
			</div>
			<div class="grid grid-cols-[1fr_2fr] items-center">
				<label for="table-size">Table Size</label>
				<select id="table-size" class="item t-border justify-center">
					<option>Small</option>
					<option>Medium</option>
					<option>Large</option> 
				</select>
			</div>
			<div class="grid grid-cols-[1fr_2fr] items-center">
				<label for="sound">Sound</label>
				<select id="sound" class="item t-border justify-center">
					<option>On</option>
					<option>Off</option>
				</select>
			</div>
			<button id="save-settings" type="button" class="item t-border">Save</button>
		`);
		document.getElementById('save-settings')!.addEventListener('click', menu.saveSettingsHandler);

		// Initialize game info
		menu.initGameMenu();
		setTimeout(() => { //* TEMP FIX
			initializeGameMainMenu(this);
		}, 200);
		document.getElementById('game-main-menu')!.addEventListener('click', (event) => this.setGameMenuToggler(event));
	}
	onCleanup() { }
	getHtml(): string {
		return /*html*/`
			${sidebar.getHtml()}
			<main class="card t-border flex flex-1 justify-around items-center font-['Press_Start_2P']">
				<div id="game-main-menu" class="flex flex-col items-center">
					<h1 id="main-menu-title" class="font-bold text-8xl mb-20 max-lg:text-7xl">PONGIFY</h1>
					<div class="flex gap-5">
						<div class="flex flex-col w-80">
							${dropdown.getHtml('Single')}
							${dropdown.getHtml('Multi')}
							${dropdown.getHtml('Co-Op')}
							${dropdown.getHtml('Settings')}
						</div>
						<div id="lobby" class="hidden flex-col items-center justify-center w-100 space-y-3">
							<h2 class="text-3xl font-bold">Lobby</h2>
							<ul class="grid grid-cols-4">
								<li class="text-c-secondary">Host</li>
								<li class="text-c-secondary">Mode</li>
								<li class="text-c-secondary w-22">Max Players</li>
								<li class="text-c-secondary"></li>
							</ul>
							<ul id="lobby-list" class="grid grid-cols-4 gap-2 overflow-scroll max-h-65">
							</ul>
						</div>
					</div>
				</div>
				<canvas id="gameCanvas" class="hidden"></canvas>
				<div id="scoreboard" class="hidden"></div>
				<div id="game-message" class="hidden z-1000 text-7xl"></div>
			</main>
		`;
	}
	setGameMenuToggler(e: Event) {
		const target = e.target as HTMLElement;
		if (target.id.startsWith('dropdownButton-')) {
			const menus = document.querySelectorAll('[id^="dropdownMenu-"]');
			menus.forEach(menuI => {
				let menuElem = menuI as HTMLElement;
				if (!menuElem.classList.contains('hidden') && menuElem != target.nextElementSibling) {
					menuElem?.classList.toggle('hidden');
					menuElem?.classList.toggle('flex');
				}
			});
		}
	}
	addLobbyBlock(gameOptionId: string, gameOption: string | number) {
		const lobby = document.getElementById('lobby-list');
		const entry = document.createElement('li') as HTMLElement;
		entry.id = `entry-${gameOptionId}-${gameOption}`;
		entry.innerHTML = `${gameOption}`;
		lobby?.appendChild(entry);
	}
	addLobbyEntry(id: string, userName: string, gameType: string, maxPlayer: string, onClickHandler?: () => void) {
		this.addLobbyBlock(id, userName);
		this.addLobbyBlock(id, gameType);
		this.addLobbyBlock(id, maxPlayer);
		this.addLobbyBlock(id, /*html*/`
			<button id="join-button-${id}" class="text-blue-500 hover:text-blue-800 hover:underline">JOIN</button>
		`);
		if (onClickHandler) {
			document.getElementById(`join-button-${id}`)?.addEventListener('click', onClickHandler);
		}
		lib.showToast.blue(`Lobby entry n: ${id} added`);
	}
	removeLobbyEntry(id: string) {
		const lobby = document.getElementById('lobby-list');
		const entries = lobby?.querySelectorAll(`[id^="entry-${id}-"]`);
		entries?.forEach(entry => entry.remove());
		lib.showToast.yellow(`Lobby entry n: ${id} removed`);
	}
}

const game: Game = new Game();
export default game;
