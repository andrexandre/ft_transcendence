
export function navigate(path: string) {
	history.pushState({}, "", path);
	window.dispatchEvent(new CustomEvent('navigateTo', { detail: path }));
}

export function assignButtonNavigation(buttonName: string, path: string) {
	document.getElementById(buttonName)?.addEventListener("click", () => navigate(path));
}
