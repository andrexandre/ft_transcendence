import '@fortawesome/fontawesome-free/css/all.min.css';
import "./tw.css"
import Page from "./pages/Page"
import dashboard from "./pages/dashboard"
import login from "./pages/login"
import register from "./pages/register"
import lib from "./lib"
import "./entrypoint"
import { navigate, assignButtonNavigation } from "./utils/navigation";

function loadPage(path: string): void {
	const content = document.getElementById("app") as HTMLElement;
	let CurrentPage: Page = dashboard;

	switch (path) {
		case "/login":
			CurrentPage = login;
			content.innerHTML = login.getHtml();
			break;
		case "/register":
			CurrentPage = register;
			content.innerHTML = register.getHtml();
			break;
		default:
			lib.showToast.failure("404 - Page Not Found");
			history.replaceState(null, "", "/");
		case "/":
			CurrentPage = dashboard;
			content.innerHTML = dashboard.getHtml();
			break;
	}
	CurrentPage.mount();
}

// fix circular dependency for navigate function
window.addEventListener('navigateTo', (e) => {
	loadPage((e as CustomEvent).detail);
});

window.addEventListener("popstate", () => {
	loadPage(location.pathname);
});

loadPage(location.pathname);

export { navigate, assignButtonNavigation };
