
// Code i might need later :)
// cat file.html
// <h1>Vite + TypeScript = {{component}}</h1>
// import file from './file.html?raw';
// function buildHtmlFile(content: string, args: Record<string,unknown>) {	
// 	return content.replace(/{{(.*)}}/g, (_match, arg) => {
// 		return `${args[arg as string] || "KEY NOT FOUND"}`
// 	})
// }
// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
// 	<div>${buildHtmlFile(file, {component: "profit?"})}</div>`

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
		lib.userInfo.path = url;
		this.mounted = true;
		this.onMount();
		setTimeout(() => {
			if (lib.Cookies.get('outline')) {
				document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
				lib.Cookies.set('outline', 'true');
			}
		}, 50);
		return this.root;
	}
	abstract getHtml(): string;
	addCleanupHandler(fn: () => void) {
		this.cleanupHandlers.push(fn);
	}
	cleanup() {
		this.cleanupHandlers.forEach(handler => {
			handler();
		})
		this.cleanupHandlers = [];
		this.mounted = false;
		this.root?.remove();
		this.root = undefined;
		this.onCleanup();
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
