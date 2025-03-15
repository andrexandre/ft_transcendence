// import Cookies from 'js-cookie';
// Cookies.set("sidebarOpened", "true");

export function showToast(message?: string, type: string = ""): void {
	const toast = document.createElement('div');
	toast.id = 'toast';
	if (!message)
		message = "Bro, you just got Toasted!"
	toast.innerText = message;
	document.getElementById('toast-container')!.appendChild(toast);

	if (type == 'success') {
		toast.style.borderColor = 'darkgreen';
		toast.style.color = 'darkgreen';
		toast.style.backgroundColor = 'lightgreen';
	} else if (type == 'failure') {
		toast.style.borderColor = 'darkred';
		toast.style.color = 'darkred';
		toast.style.backgroundColor = 'lightcoral';
	} else if (!type) {
		toast.className = "text-stone-800 bg-stone-100 border-stone-400";
	} else {
		toast.className = `text-${type}-800 bg-${type}-100 border-${type}-400`;
	}
	toast.textContent = message;
	setTimeout(() => toast.remove(), 2100);
}
showToast.success = (message?: string) => showToast(message, "success");
showToast.failure = (message?: string) => showToast(message, "failure");

const lib = { showToast };

export default lib;

// put his in the beginning of a file to re-export:
// export { default as lib } from "./lib"
