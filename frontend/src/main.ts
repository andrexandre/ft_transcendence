import '@fortawesome/fontawesome-free/css/all.min.css'
import "./tw.css"
import "./entrypoint"
import Page from "./pages/Page"
import register from "./pages/register"
import login from "./pages/login"
import dashboard from "./pages/dashboard"
import settings from "./pages/settings"
import game from "./pages/game/page"
import chat from "./pages/chat/page"
import * as lib from "./utils"

let currentPage: Page | undefined;

// TODO fix already logged in user
const checkLogin = async () => {
	try {
		const response = await fetch('http://127.0.0.1:7000/fetchDashboardData', {
			credentials: 'include',
		});
		if (!response.ok) {
			lib.navigate('/login');
			throw new Error(`${response.status} - ${response.statusText}`);
		}
		let dashData = await response.json();
		lib.userInfo.username = dashData.username
		lib.userInfo.userId = dashData.userId
		lib.userInfo.auth_method = dashData.auth_method
	} catch (error) {
		console.log(error);
		lib.showToast.red(error as string);
	}
}

function setColorTheme(theme: string, _color?: string) {
	if (theme === "game") {
		document.documentElement.style.setProperty('--color-c-bg', 'var(--color-g-c-bg)');
		document.documentElement.style.setProperty('--color-c-secondary', 'var(--color-g-c-secondary)');
		document.documentElement.style.setProperty('--color-c-text', 'var(--color-g-c-text)');
		document.documentElement.style.setProperty('--color-c-primary', 'var(--color-g-c-primary)');
	}
	else {
		document.documentElement.style.setProperty('--color-c-bg', 'var(--color-d-c-bg)');
		document.documentElement.style.setProperty('--color-c-secondary', 'var(--color-d-c-secondary)');
		document.documentElement.style.setProperty('--color-c-text', 'var(--color-d-c-text)');
		document.documentElement.style.setProperty('--color-c-primary', 'var(--color-d-c-primary)');
	}
}

function loadPage(path: string): void {
	let newPage: Page;

	if (path != "/register" && path != "/login")
		checkLogin();
	if (path === "/game") {
		setColorTheme("game");
	} else {
		setColorTheme("light", "stone");
	}
	switch (path) {
		case "/register":
			newPage = register;
			break;
		case "/login":
			newPage = login;
			break;
		case "/settings":
			newPage = settings;
			break;
		case "/game":
			newPage = game;
			break;
		case "/chat":
			newPage = chat;
			break;
		default:
			lib.showToast.red("404 - Page Not Found");
			history.replaceState(null, "", "/");
		case "/":
			newPage = dashboard;
			break;
	}
	currentPage?.cleanup();
	document.getElementById("app")!.innerHTML = newPage.getHtml();
	newPage.mount();
	if (lib.Cookies.get('outline')) {
		document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
		lib.Cookies.set('outline', 'true');
	}
	currentPage = newPage;
}

// fix circular dependency for navigate function
window.addEventListener('navigateTo', (e) => {
	loadPage((e as CustomEvent).detail);
});

window.addEventListener("popstate", () => {
	loadPage(location.pathname);
});

loadPage(location.pathname);
