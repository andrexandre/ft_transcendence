import Page from "../Page"
import * as lib from "../../utils"
import sidebar from "../../components/sidebar"

class Chat extends Page {
	constructor() {
		super("chat", '/chat');
	}
	onMount(): void {
		// this.setCustomHandler
		sidebar.setSidebarToggler();
	}
	onCleanup(): void {}
	getHtml(): string {
		return /*html*/`
			${sidebar.getHtml()}
			<main class="dash-component flex flex-1 justify-around items-center">
				Custom page html
			</main>
		`;
	}
	setCustomHandler() {
		const customElement = document.querySelector('customElement');
		const handler = () => {
		}
		customElement?.addEventListener('submit', handler);
		this.addCleanupHandler(() => customElement?.removeEventListener('submit', handler));
	}
}

const chat: Chat = new Chat();
export default chat;
