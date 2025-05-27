import { turnOnChat, turnOffChat } from "../pages/chat/friends"
import { turnOnGame, turnOffGame } from "../pages/game/menu"

export { default as Cookies } from 'js-cookie';
import { renderPattern } from "./patterns";
// export { animate, scroll } from "motion"

export const colors: string[] = ["red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "slate", "gray", "zinc", "neutral", "stone", "rose", "pink", "fuchsia", "purple", "violet", "indigo"];
export const defaultColor = 'slate';

export var userInfo = {
	username: "",
	codename: "",
	biography: "",
	userId: "",
	auth_method: "",
	// profileImage: "",
	path: "",
	// aDelay: 0.2,
	chat_sock: null as WebSocket | null,
	game_sock: null as WebSocket | null,
	pendingInviteTo: null as string | null
}

// onBeforeClose?: Promise<void> / waitForEvent?: { element: HTMLElement; event: string }
export function showToast(message?: string, type: string = "") {
	const toast = document.createElement('div');
	toast.id = 'toast';
	toast.textContent = message || "Bro, you just got Toasted!";
	document.getElementById('toast-container')!.appendChild(toast);

	if (!["green", "red", "blue", "yellow"].includes(type))
		type = "default";
	toast.className = `toast-${type}`;
	setTimeout(() => toast.remove(), 3100);
}
showToast.green = (message?: string) => showToast(message, "green");
showToast.red = (message?: string) => showToast(message, "red");
showToast.blue = (message?: string) => showToast(message, "blue");
showToast.yellow = (message?: string) => showToast(message, "yellow");

export function loadTheme() {
	if (localStorage.getItem('theme') === 'dark')
		document.documentElement.classList.add('dark');
	else if (localStorage.getItem('theme') === 'light')
		document.documentElement.classList.remove('dark');
	else if (window.matchMedia('(prefers-color-scheme: dark)').matches)
		document.documentElement.classList.add('dark');
	renderPattern();
	// console.debug(`Theme set to ${localStorage.getItem('theme') ? localStorage.getItem('theme') : 'auto'}`);
	// console.debug(`System theme set to ${window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}`);
}

export function setTheme(option: string, save?: boolean) {
	if (option == "auto") {
		document.documentElement.classList.remove('dark');
		if (save) localStorage.removeItem('theme');
		if (window.matchMedia('(prefers-color-scheme: dark)').matches)
			document.documentElement.classList.add('dark');
	} else if (option == "dark") {
		document.documentElement.classList.add('dark');
		if (save) localStorage.setItem('theme', 'dark');
	} else if (option == "light") {
		document.documentElement.classList.remove('dark');
		if (save) localStorage.setItem('theme', 'light');
	}
	renderPattern();
	// console.debug(`Theme set to ${option}`);
}

export function getTheme() {
	if (localStorage.getItem('theme') === 'dark')
		return 'dark';
	else if (localStorage.getItem('theme') === 'light')
		return 'light';
	else
		return 'auto';
}

export function setColor(color: string, save?: boolean) {
	document.documentElement.style.setProperty('--color-c-bg', `var(--color-c-${color}-bg)`);
	document.documentElement.style.setProperty('--color-c-secondary', `var(--color-c-${color}-secondary)`);
	document.documentElement.style.setProperty('--color-c-text', `var(--color-c-${color}-text)`);
	document.documentElement.style.setProperty('--color-c-primary', `var(--color-c-${color}-primary)`);
	if (save) localStorage.setItem('color', color);
	renderPattern();
	// console.debug(`Color set to ${color}`);
}

export function toggleUserServices(on: boolean) {
	if (on) {
		turnOnChat();
		turnOnGame();
	} else {
		turnOffChat();
		turnOffGame();
	}
}

export function convertBlobToBase64(blob: Blob): Promise<string | ArrayBuffer | null> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result);
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

// lib.fullScreenOverlay(
// 	/*html*/`
// 		<h1>Hello HTML</h1>
// 	`,
// 	/*style*/`
// 		.hello-CSS {}
// 	`,
// 	() => {
// 		console.log('Hello JS')
// 	}
// );

export function fullScreenOverlay(html: string = '', css: string = '', js?: () => void) {
	const overlay = Object.assign(document.body.appendChild(document.createElement('div')), {
		style: /*style*/`
			position: fixed;
			inset: 0;
			background: rgba(0, 0, 0, 0.9);
			color: white;
			z-index: 9999;
			display: flex;
			justify-content: center;
			align-items: center;
		`
	});
	overlay.innerHTML = html;
	const styleElement = document.createElement('style');
	styleElement.textContent = css;
	overlay.appendChild(styleElement);
	if (js) js();
}
