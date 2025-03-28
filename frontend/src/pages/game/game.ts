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
		tempInitializeDropdown('Multi', 'Tournament', "Don't click");
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
					<h1 class="font-bold text-9xl mb-8">Gamify</h1>
					${dropdown.getHtml('Single')}
					${dropdown.getHtml('Multi')}
					${dropdown.getHtml('Co-Op')}
					${dropdown.getHtml('Settings')}
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
