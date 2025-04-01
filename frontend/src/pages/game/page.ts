import Page from "../Page"
import * as lib from "../../utils"
import sidebar from "../../components/sidebar"
import dropdown from "../../components/dropdown"
import * as menu from "./menu"
import * as logic from "./single"

function tempInitializeDropdown(id: string, option1: string, option2: string) {
	dropdown.setDropdownToggler(id);
	if (id == 'Single' && option1 == 'Classic') {
		const username = sessionStorage.getItem("username");
		if (!username) {
			console.error("❌ No username found in sessionStorage!");
			return;
		}
		dropdown.addComponent(id, 'button', 'game-component',
			option1,
			() => {
				const difficulty = sessionStorage.getItem("user_set_dificulty") || "Normal";
				const tableSize = sessionStorage.getItem("user_set_tableSize") || "Medium";
				const sound = sessionStorage.getItem("user_set_sound") === "1";
				logic.startSingleClassic(username, { difficulty, tableSize, sound })
				const closeButton = document.getElementById('hide-button');
				closeButton?.click();
			});
	}
	else {
		dropdown.addComponent(
			id, 'button', 'game-component',
			option1,
			() => lib.showToast(`${id} ${option1} clicked`)
		);
	}
	dropdown.addComponent(id, 'button', 'game-component',
		option2, () => { lib.showToast(`${id} ${option2} clicked`); });
}

class Game extends Page {
	constructor() {
		super("game", '/game');
	}
	onMount(): void {
		sidebar.setSidebarToggler();
		tempInitializeDropdown('Single', 'Classic', 'Infinity');
		// tempInitializeDropdown('Multi', 'Tournament', "Don't click");
		// Insane set Multi dropdown handler
		dropdown.setDropdownToggler('Multi', () => {
			const lobby = document.getElementById('lobby');
			lobby?.classList.toggle('hidden');
		});
		dropdown.addComponent('Multi', 'button', 'game-component',
			'Tournament', () => { lib.showToast(`${'Multi'} ${'Tournament'} clicked`); });
		dropdown.addComponent('Multi', 'button', 'game-component',
			"Don't click", () => { lib.showToast(`${'Multi'} ${"Don't click"} clicked`); });

		tempInitializeDropdown('Co-Op', 'Soccer', 'Free for all');
		dropdown.setDropdownToggler('Settings');
		dropdown.addComponent('Settings', 'div', 'flex flex-col', /*html*/`
			<div class="grid grid-cols-[1fr_2fr] items-center">
				<label for="difficulty">Difficulty</label>
				<select id="difficulty" class="game-component justify-center">
					<option>Easy</option>
					<option>Normal</option>
					<option>Hard</option>
				</select>
			</div>
			<div class="grid grid-cols-[1fr_2fr] items-center">
				<label for="table-size">Table Size</label>
				<select id="table-size" class="game-component justify-center">
					<option>Small</option>
					<option>Medium</option>
					<option>Large</option> 
				</select>
			</div>
			<div class="grid grid-cols-[1fr_2fr] items-center">
				<label for="sound">Sound</label>
				<select id="sound" class="game-component justify-center">
					<option>On</option>
					<option>Off</option>
				</select>
			</div>
			<button id="save-settings" type="button" class="game-component">Save</button>
		`);
		document.getElementById('save-settings')!.addEventListener('click', menu.saveSettingsHandler);
		menu.initGameMenu();
		document.getElementById('game-main-menu')!.addEventListener('click', (event) => this.setGameMenuToggler(event));
	}
	onCleanup() { }
	getHtml(): string {
		return /*html*/`
			${sidebar.getHtml()}
			<main class="dash-component flex flex-1 justify-around items-center">
				<div id="game-main-menu" class="flex flex-col items-center">
					<h1 class="font-bold text-9xl mb-20">Pongify</h1>
					<div class="flex gap-10">
						<div class="flex flex-col">
							${dropdown.getHtml('Single')}
							${dropdown.getHtml('Multi')}
							${dropdown.getHtml('Co-Op')}
							${dropdown.getHtml('Settings')}
						</div>
						<div id="lobby" class="hidden flex-col items-center justify-center">
							<h2 class="text-2xl font-bold mb-4">Lobby</h2>
							<ul id="lobby-list" class="w-full flex flex-col gap-2">
								<li class="p-2 bg-white rounded shadow">Player 1</li>
								<li class="p-2 bg-white rounded shadow">Player 2</li>
							</ul>
							<button id="start-game" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Start Game</button>
						</div>
					</div>
				</div>
				<canvas id="gameCanvas" class="hidden"></canvas>
				<div id="scoreboard" class="hidden"></div>
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
					const icon = menuElem.previousElementSibling?.querySelector('i');
					icon?.classList.toggle("fa-chevron-up");
					icon?.classList.toggle("fa-chevron-down");
				}
			});
		}

	}
}

const game: Game = new Game();
export default game;
