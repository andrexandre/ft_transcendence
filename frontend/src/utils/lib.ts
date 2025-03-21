export { default as Cookies } from 'js-cookie';

export var userInfo = {
	username: ""
}

export function showToast(message?: string, type: string = ""): void {
	const toast = document.createElement('div');
	toast.id = 'toast';
	toast.textContent = message || "Bro, you just got Toasted!";
	document.getElementById('toast-container')!.appendChild(toast);

	switch (type) {
		case "green":
			toast.className = "bg-green-100 border-green-400 text-green-800 hover:border-green-800";
			break;
		case "red":
			toast.className = "bg-red-100 border-red-400 text-red-800 hover:border-red-800";
			break;
		case "blue":
			toast.className = "bg-blue-100 border-blue-400 text-blue-800 hover:border-blue-800";
			break;
		case "yellow":
			toast.className = "bg-yellow-100 border-yellow-400 text-yellow-800 hover:border-yellow-800";
			break;
		default:
			toast.className = "bg-lighter border-light text-darker hover:border-darker";
	}
	setTimeout(() => toast.remove(), 3100);
}
showToast.green = (message?: string) => showToast(message, "green");
showToast.red = (message?: string) => showToast(message, "red");
showToast.blue = (message?: string) => showToast(message, "blue");
showToast.yellow = (message?: string) => showToast(message, "yellow");
