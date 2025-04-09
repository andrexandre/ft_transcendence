import Page from "../Page"
import * as lib from "../../utils"
import sidebar from "../../components/sidebar"
import dropdown from "../../components/dropdown"
import * as menu from "./menu"

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
		menu.initUserData();
		// document.getElementById('sidebar')?.classList.toggle('hidden');
		// document.getElementById('dropdownButton-Multi')?.click();
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
						<div id="lobby" class="hidden flex-col items-center justify-center w-100 space-y-3 item t-border">
							<ul class="grid grid-cols-4">
								<li class="text-c-secondary">Host</li>
								<li class="text-c-secondary">Mode</li>
								<li class="text-c-secondary w-22">#/#</li>
								<li class="text-c-secondary"></li>
							</ul>
							<ul id="lobby-list" class="grid grid-cols-4 gap-2 overflow-scroll max-h-65 text-sm">
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
	removeLobbyEntry(id: string) {
		const lobby = document.getElementById('lobby-list');
		const entries = lobby?.querySelectorAll(`[id^="entry-${id}-"]`);
		entries?.forEach(entry => entry.remove());
		lib.showToast.yellow(`Lobby entry n: ${id} removed`);
	}
}

const game: Game = new Game();
export default game;
