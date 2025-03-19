import Page from "../Page"
import * as lib from "../../utils"
import sidebar from "../../components/sidebar"
import dropdown from "../../components/dropdown"

function tempInitializeDropdown(id: string) {
	dropdown.setDropdownToggler(id);
	dropdown.addOption(id, 'Option 1', () => {lib.showToast(`${id} Option 1 clicked`);});
	dropdown.addOption(id, 'Option 2', () => {lib.showToast(`${id} Option 2 clicked`);});
}

class Game extends Page {
	constructor() {
		super("game", '/game');
	}
	onMount(): void {
		// this.setCustomHandler();
		sidebar.setSidebarToggler();
		lib.assignButtonNavigation('home-button', '/');
		document.getElementById("notifications-button")!.addEventListener("click", () => {
			lib.showToast();
		});
		tempInitializeDropdown('Single');
		tempInitializeDropdown('Multi');
		tempInitializeDropdown('Co-Op');
		tempInitializeDropdown('Settings');
		document.getElementById('game-main-menu')!.addEventListener('click', (event) => {
			const target = event.target as HTMLElement;
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
		});
	}
	onCleanup(): void {}
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
			</main>
		`;
	}
	setCustomHandler() {
		const customElement = document.querySelector('customElement');
		const handler = () => {
			// handler code
		}
		customElement?.addEventListener('submit', handler);
		this.addCleanupHandler(() => customElement?.removeEventListener('submit', handler));
	}
}

const game: Game = new Game();
export default game;
