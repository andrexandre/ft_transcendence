export { default as Cookies } from 'js-cookie';

export var userInfo = {
	username: "",
	userId: "",
	auth_method: "",
	profileImage: "",
}

export function showToast(message?: string, type: string = ""): void {
	const toast = document.createElement('div');
	toast.id = 'toast';
	toast.textContent = message || "Bro, you just got Toasted!";
	document.getElementById('toast-container')!.appendChild(toast);

	if (type !== "green" && type !== "red" && type !== "blue" && type !== "yellow")
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
