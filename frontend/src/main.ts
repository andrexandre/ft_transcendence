import '@fortawesome/fontawesome-free/css/all.min.css';
import "./tw.css"
import dashboard from "./pages/dashboard"
import login from "./pages/login"
import register from "./pages/register"
import lib from "./lib"
import "./entrypoint"

// import { dashboard, login, register } from "./pages" // ./pages/index
// import "./styles"
// import { lib } from "./utils"


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


export function navigate(event: Event, path: string): void {
	event.preventDefault();
	history.pushState({}, "", path);
	loadPage(path);
}

function assignButtonNavigation(buttonName: string, path: string): void {
	document.getElementById(buttonName)!.addEventListener("click", (event) => {
		navigate(event, path);
	});
}

function loadPage(path: string): void {
	const content = document.getElementById("app") as HTMLElement;
	// const navbarHTML = await navbar.getHtml();
	// put this inside the innerHTML: ${navbarHTML}
	// after changing the html, we can execute the js using: navbar.execJS();

	switch (path) {
		case "/login":
			content.innerHTML = login.getHtml();
			login.setSubmissionHandler('http://127.0.0.1:7000/login');
			assignButtonNavigation('register-button', '/register');
			assignButtonNavigation('dashboard-button', '/');
			break;
		case "/register":
			content.innerHTML = register.getHtml();
			register.setSubmissionHandler('http://127.0.0.1:7000/register');
			assignButtonNavigation('login-button', '/login');
			break;
		default:
			lib.showToast(false, "404 - Page Not Found");
			history.replaceState(null, "", "/");
		case "/":
			content.innerHTML = dashboard.getHtml();
			document.getElementById("game-button")!.addEventListener("click", () => {
				window.location.href = "http://127.0.0.1:5000";
			});
			document.getElementById("chat-button")!.addEventListener("click", () => {
				window.location.href = "http://127.0.0.1:2000/?user=Antony";
			});
			dashboard.setSidebarToggler();
			assignButtonNavigation('settings-button', '/login');
			break;
	}
}

window.addEventListener("popstate", () => {
	loadPage(location.pathname);
});

loadPage(location.pathname);
