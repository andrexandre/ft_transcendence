import '@fortawesome/fontawesome-free/css/all.min.css'
import "./tw.css"
import "./entrypoint"
import Page from "./pages/Page"
import register from "./pages/register"
import login from "./pages/login"
import dashboard from "./pages/dashboard"
import game from "./pages/game/game"
import * as lib from "./utils"

let currentPage: Page | undefined;

function loadPage(path: string): void {
	let newPage: Page;

	switch (path) {
		case "/register":
			newPage = register;
			break;
		case "/login":
			newPage = login;
			break;
		case "/game":
			newPage = game;
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
}

// fix circular dependency for navigate function
window.addEventListener('navigateTo', (e) => {
	loadPage((e as CustomEvent).detail);
});

window.addEventListener("popstate", () => {
	loadPage(location.pathname);
});

loadPage(location.pathname);
