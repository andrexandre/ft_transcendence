import Page from "./Page"
import * as lib from "../utils"
import sidebar from "../components/sidebar"

class Profile extends Page {
	constructor() {
		super("profile", '/profile');
	}
	onMount(): void {
		sidebar.setSidebarToggler('profile');
		// this.saveProfileInformation();
	}
	onCleanup(): void {}
	getHtml(): string {
		return /*html*/`
			${sidebar.getHtml()}
			<main class="card t-dashed flex-1">
				<h1>Hello profile</h1>
			</main>
		`;
	}
	saveProfileInformation() {
		const customElement = document.querySelector('customElement');
		const handler = () => {
		}
		customElement?.addEventListener('submit', handler);
		this.addCleanupHandler(() => customElement?.removeEventListener('submit', handler));
	}
}

const profile: Profile = new Profile();
export default profile;
