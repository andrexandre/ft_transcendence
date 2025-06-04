import * as lib from "./utils"

document.addEventListener('keydown', (event: KeyboardEvent) => {
	if (document.activeElement instanceof HTMLInputElement ||
		document.activeElement instanceof HTMLTextAreaElement ||
		(document.activeElement && document.activeElement.getAttribute("contenteditable") === "true")) {
		return;
	}
	if (event.key === " ") {
		event.preventDefault();
		const allElements = document.querySelectorAll('*');
		allElements.forEach(element => {
			const htmlElement = element as HTMLElement;
			if (htmlElement.style.outline === '1px solid blue' || htmlElement.style.outlineOffset === '-1px') {
				htmlElement.style.outline = '';
				htmlElement.style.outlineOffset = '';
				lib.Cookies.remove('outline');
			} else {
				htmlElement.style.outline = '1px solid blue';
				htmlElement.style.outlineOffset = '-1px';
				lib.Cookies.set('outline', 'true');
			}
		});
	}
});

lib.setColor(localStorage.getItem('color') || lib.defaultColor, true);
lib.loadTheme();

sessionStorage.clear();

export const authChannel = new BroadcastChannel('auth');

authChannel.onmessage = (event) => {
	if (event.data.type === 'logout' &&
		(lib.userInfo.path != "/register" && lib.userInfo.path != "/login"))
		lib.executeLogout();
};
