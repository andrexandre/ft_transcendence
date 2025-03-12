import Cookies from 'js-cookie';
Cookies.set("jscookieImported", "true");

export function showToast(success: boolean, message: string | null): void {
	const displayDuration = 2000;
	const fadeOutDuration = 1000;
	const toast = document.getElementById('toast-default') as HTMLInputElement;
	toast.style.transition = `opacity ${fadeOutDuration}ms`;
	toast.style.opacity = '1';

	if (success) {
		toast.style.borderColor = 'darkgreen';
		toast.style.color = 'darkgreen';
		toast.style.backgroundColor = 'lightgreen';
		toast.textContent = message || 'Operation successful!';
	} else {
		toast.style.borderColor = 'darkred';
		toast.style.color = 'darkred';
		toast.style.backgroundColor = 'lightcoral';
		toast.textContent = message || 'Operation failed!';
	}
	setTimeout(() => {
		toast.style.opacity = '0';
	}, displayDuration);
}

const lib = { showToast };

export default lib;

// after that put this in the file that needs importing:
// export { default as lib } from "./lib"
