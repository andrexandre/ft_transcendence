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
	}
	onCleanup(): void {}
	getHtml(): string {
		return /*html*/`
			${sidebar.getHtml()}
			<main class="dash-component flex flex-1 justify-around items-center">
				<div id="menu" class="dash-component flex flex-col p-5">
					<h1 id="title" class="font-bold">Game ON</h1>
					<button>Single</button>
					<button>Multi</button>
					<button>Co-Op</button>
					<button>Settings</button>
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
