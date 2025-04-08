export { default as Cookies } from 'js-cookie';

export var userInfo = {
	username: "",
	userId: "",
	auth_method: "",
}

export function showToast(message?: string, type: string = ""): void {
	const toast = document.createElement('div');
	toast.id = 'toast';
	toast.textContent = message || "Bro, you just got Toasted!";
	document.getElementById('toast-container')!.appendChild(toast);

	switch (type) {
		case "green":
			toast.className = "bg-green-100 text-green-800 border-green-400 hover:border-green-800";
			break;
		case "red":
			toast.className = "bg-red-100 text-red-800 border-red-400 hover:border-red-800";
			break;
		case "blue":
			toast.className = "bg-blue-100 text-blue-800 border-blue-400 hover:border-blue-800";
			break;
		case "yellow":
			toast.className = "bg-yellow-100 text-yellow-800 border-yellow-400 hover:border-yellow-800";
			break;
		default:
			toast.className = "bg-c-bg border-c-secondary text-c-primary hover:border-c-primary";
	}
	setTimeout(() => toast.remove(), 3100);
}
showToast.green = (message?: string) => showToast(message, "green");
showToast.red = (message?: string) => showToast(message, "red");
showToast.blue = (message?: string) => showToast(message, "blue");
showToast.yellow = (message?: string) => showToast(message, "yellow");

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
