
import * as lib from "../utils";

export default abstract class Page {
	protected root: HTMLElement | undefined = undefined;
	public mounted: boolean = false;
	private cleanupHandlers: (() => void)[] = []
	constructor(public readonly name: string, public readonly path: string) {
	}

	protected abstract onMount(): void;
	protected abstract onCleanup(): void;

	// const content = this.getHtml();
	// this.root = document.createElement('div');
	// this.root.id = `page-${this.name}`;
	// this.root.classList.add('w-full', 'h-full');
	// this.root.innerHTML = content;
	mount(url: string) {
		// if (lib.userInfo.path && (url == '/login' || url == '/register'))
		// 	lib.animate("main", { x: [100, 0] }, { duration: lib.userInfo.aDelay, ease: "easeOut" });
		// lib.animate("main", { opacity: 1 }, { duration: lib.userInfo.aDelay });
		document.title = `${this.name.charAt(0).toUpperCase() + this.name.slice(1)} - Transcendence`;
		lib.userInfo.path = url;
		this.mounted = true;
		this.onMount();
		setTimeout(() => {
			if (lib.Cookies.get('outline')) {
				document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
				lib.Cookies.set('outline', 'true');
			}
			// document.getElementsByTagName("main")[0]!.style.opacity = "1";
		}, 50);
		return this.root;
	}
	abstract getHtml(): string;
	addCleanupHandler(fn: () => void) {
		this.cleanupHandlers.push(fn);
	}
	cleanup() {
		this.cleanupHandlers.forEach(handler => handler());
		this.cleanupHandlers = [];
		this.mounted = false;
		this.root?.remove();
		this.root = undefined;
		this.onCleanup();
		// if (lib.userInfo.path == '/login' || lib.userInfo.path == '/register')
		// 	lib.animate("main", { x: [0, 100] }, { duration: lib.userInfo.aDelay, ease: "easeOut" });
		// lib.animate("main", { opacity: 0 }, { duration: lib.userInfo.aDelay });
		// document.getElementsByTagName("main")[0]!.style.opacity = "0";
	}
}

// Sample code to add a page:

// import Page from "./Page"
// import * as lib from "../utils"

// class CustomPage extends Page {
// 	constructor() {
// 		super("custompage", '/custompage');
// 	}
// 	onMount(): void {
// 		this.setCustomHandler();
// 	}
// 	onCleanup(): void {}
// 	getHtml(): string {
// 		return /*html*/`
// 			<h1>Custom page html</h1>
// 		`;
// 	}
// 	setCustomHandler() {
// 		const customElement = document.querySelector('customElement');
// 		const handler = () => {
// 		}
// 		customElement?.addEventListener('submit', handler);
// 		this.addCleanupHandler(() => customElement?.removeEventListener('submit', handler));
// 	}
// }

// const custompage: CustomPage = new CustomPage();
// export default custompage;
