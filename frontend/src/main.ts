// import login from "./auth/login.js"
// import register from "./auth/register.js"

document.getElementById("game-button")!.addEventListener("click", () => {
	window.location.href = "http://127.0.0.1:5000";
});

// document.getElementById("settings-button")!.addEventListener("click", (event) => {
// 	navigate(event, '/login');
// });

// document.getElementById("app")!.innerHTML = /*html*/``;

// function navigate(event: MouseEvent, path: string): void {
// 	event.preventDefault();
// 	history.pushState({}, "", path);
// 	loadPage(path);
// }

// function loadPage(path: string): void {
// 	const content = document.getElementById("app") as HTMLElement;

// 	switch (path) {
// 	  case "/login":
// 		content.innerHTML = login();
// 		break;
// 	  case "/register":
// 		content.innerHTML = register();
// 		break;
// 	  default:
// 		content.innerHTML = `<h1>Page Not Found</h1>`;
// 		break;
// 	}
// }

// window.addEventListener("popstate", () => {
// 	loadPage(location.pathname);
// });

// Initial page load (prevents blank page on direct visit) NEEDS TESTING
// document.addEventListener("DOMContentLoaded", () => {
// 	loadPage(location.pathname);
// });
