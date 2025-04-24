import { socketOnMessage } from "../pages/chat/friends"
export { default as Cookies } from 'js-cookie';

export const colors: string[] = ["red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "slate", "gray", "zinc", "neutral", "stone", "rose", "pink", "fuchsia", "purple", "violet", "indigo"];
export const defaultColor = 'slate';

export var userInfo = {
	username: "",
	codename: "",
	biography: "",
	userId: "",
	auth_method: "",
	profileImage: "",
	path: "",
	chat_sock: null as WebSocket | null
}

// onBeforeClose?: Promise<void> / waitForEvent?: { element: HTMLElement; event: string }
export function showToast(message?: string, type: string = "") {
	const toast = document.createElement('div');
	toast.id = 'toast';
	toast.textContent = message || "Bro, you just got Toasted!";
	document.getElementById('toast-container')!.appendChild(toast);

	if (type != "green" && type != "red" && type != "blue" && type != "yellow")
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
	// else { // to replace in case the previous else if is not working
	// 	document.documentElement.classList.remove('dark');
	// 	if (window.matchMedia('(prefers-color-scheme: dark)').matches) 
	// 		document.documentElement.classList.add('dark');
	// }
	// console.debug(`Theme set to ${localStorage.getItem('theme') ? localStorage.getItem('theme') : 'auto'}`);
	// console.debug(`System theme set to ${window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}`);
}

export function setTheme(option: string, save?: boolean) {
	const htmlElement = document.documentElement;
	if (option == "auto") {
		htmlElement.classList.remove('dark');
		if (save) localStorage.removeItem('theme');
		if (window.matchMedia('(prefers-color-scheme: dark)').matches)
			htmlElement.classList.add('dark');
	} else if (option == "dark") {
		htmlElement.classList.add('dark');
		if (save) localStorage.setItem('theme', 'dark');
	} else if (option == "light") {
		htmlElement.classList.remove('dark');
		if (save) localStorage.setItem('theme', 'light');
	}
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
	// console.debug(`Color set to ${color}`);
}
/**
 * @param {boolean} on - start or stops services such as game and chat sockets
 */
export function daemon(on: boolean) {
	if (on) {
		if (!userInfo.chat_sock || userInfo.chat_sock.readyState === WebSocket.CLOSED) {
			userInfo.chat_sock = new WebSocket(`ws://${location.hostname}:2000/chat-ws`);

			userInfo.chat_sock.onopen = () => {
				console.debug('Chat socket created');
			}
			
			userInfo.chat_sock.onerror = (error) => {
				console.log('WebSocket error: ', error);
			};
			
			userInfo.chat_sock.onclose = (event) => {
				console.debug('WebSocket connection closed:', event.code, event.reason);
				// Maybe add some reconnection logic here
			};
			
			userInfo.chat_sock.onmessage = (event) => {
				socketOnMessage(event);
			};
		} else {
			showToast.red('Called daemon on and the sock is already on');
		}
		// showToast('Athenticated');
	} else {
		if (userInfo.chat_sock) {
			userInfo.chat_sock.close(1000, 'User logged out');
			userInfo.chat_sock = null;
		}
		else
			showToast.red('Called daemon off and the sock is already off');
		// showToast('Unathenticated');
	}
}

// lib.fullScreenOverlay(
// 	/*html*/`<h1>Hello HTML</h1>`,
// 	/*style*/`
// 		.hello-CSS {}
// 	`,
// 	() => console.log('Hello JS')
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
