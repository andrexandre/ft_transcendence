import Page from "../Page"
import * as lib from "../../utils"
import sidebar from "../../components/sidebar"

class Game extends Page {
	constructor() {
		super("game", '/game');
	}
	onMount(): void {
		// this.setCustomHandler();
		sidebar.setSidebarToggler();
		lib.assignButtonNavigation('home-button', '/');
		const button = document.getElementById('dropdownButton');
		const menu = document.getElementById('dropdownMenu');
		button?.addEventListener('click', () => {
			menu?.classList.toggle('hidden');
			let icon = document.querySelector('#dropdownButton i');
			if (menu?.classList.contains('hidden')) {
				icon?.classList.remove("fa-chevron-up");
				icon?.classList.add("fa-chevron-down");
			} else {
				icon?.classList.remove("fa-chevron-down");
				icon?.classList.add("fa-chevron-up");
			}
		});
	}
	onCleanup(): void {}
	getHtml(): string {
		return /*html*/`
			${sidebar.getHtml()}
			<main class="dash-component flex flex-1 justify-around items-center">
				<div id="menu" class="dash-component flex flex-col p-5">
					<h1 id="title" class="font-bold text-3xl">Game ON</h1>
					<button>Single</button>
					<button>Multi</button>
					<button>Co-Op</button>
					<button>Settings</button>
				</div>

				<div class="relative text-left">
					<button id="dropdownButton" class="items-center w-full shadow-sm px-4 py-2 hover:bg-gray-50">
						Options
						<i class="ml-2 fa-solid fa-chevron-down"></i>
					</button>

					<div id="dropdownMenu" class="hidden absolute right-0 mt-2 w-30 shadow-lg hover:bg-gray-50">
						<div class="py-1">
						<a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Option 1</a>
						<a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Option 2</a>
						<a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Option 3</a>
						</div>
					</div>
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
