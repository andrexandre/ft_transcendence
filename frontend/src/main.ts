import '@fortawesome/fontawesome-free/css/all.min.css'
import "./tw.css"
import "./entrypoint"
import Page from "./pages/Page"
import dashboard from "./pages/dashboard"
import login from "./pages/login"
import register from "./pages/register"
import * as lib from "./utils"

function loadPage(path: string): void {
	let CurrentPage: Page = dashboard;

	switch (path) {
		case "/login":
			CurrentPage = login;
			break;
		case "/register":
			CurrentPage = register;
			break;
		default:
			lib.showToast.red("404 - Page Not Found");
			history.replaceState(null, "", "/");
		case "/":
			CurrentPage = dashboard;
			break;
	}
	document.getElementById("app")!.innerHTML = CurrentPage.getHtml();
	CurrentPage.mount();
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
