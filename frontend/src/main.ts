import '@fortawesome/fontawesome-free/css/all.min.css'
import "./tw.css"
import "./entrypoint"
import Page from "./pages/Page"
import register from "./pages/register"
import login from "./pages/login"
import dashboard from "./pages/dashboard"
import settings from "./pages/settings"
import profile from "./pages/profile"
import game from "./pages/game/page"
import chat from "./pages/chat/page"
import * as lib from "./utils"

let currentPage: Page | undefined;

let firstPageLoad = true;

async function loadApp(path: string) {
	// check authentication
	try {
		const response = await fetch(`https://${location.hostname}:8080/token/verifyToken`, {
			credentials: 'include',
		});
		if (!response.ok)
			throw new Error(`${response.statusText}`);
		let responseData = await response.json();
		lib.userInfo.username = responseData.username
		lib.userInfo.userId = responseData.userId
		lib.userInfo.auth_method = responseData.auth_method
		if (path == "/register" || path == "/login") {
			lib.showToast.yellow(`Already authenticated`);
			history.replaceState(null, "", "/");
			path = '/';
		}
	} catch (error: any) {
		if (path != "/register" && path != "/login") {
			console.log(error);
			lib.showToast.red(error.message);
			history.replaceState(null, "", "/login");
			path = '/login';
		}
	}
	if (firstPageLoad) {
		firstPageLoad = false;
		if (lib.userInfo.auth_method)
			lib.toggleUserServices(true);
	}
	loadPage(path);
}

function loadPage(path: string) {
	let newPage: Page;

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
		case "/profile":
		case path.startsWith("/profile/") ? path : "":
			newPage = profile;
			break;
		case "/game":
			newPage = game;
			break;
		case "/chat":
		case path.startsWith("/chat/") ? path : "":
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
	// setTimeout(() => { // the delay is for the exit animation
		document.getElementById("app")!.innerHTML = newPage.getHtml();
		newPage.mount(path);
		currentPage = newPage;
	// }, lib.userInfo.aDelay * 1000);
}

// fix circular dependency for navigate function
window.addEventListener('navigateTo', (e) => {
	loadApp((e as CustomEvent).detail);
});

// ERRO AQUI
window.addEventListener("popstate", () => {
	if (lib.userInfo.match_sock && lib.userInfo.match_sock.readyState === WebSocket.OPEN) {
		lib.userInfo.match_sock.close(1000, "Quitted the game you loser")
		lib.userInfo.match_sock = null;
	}
	loadApp(location.pathname);
});

loadApp(location.pathname);
