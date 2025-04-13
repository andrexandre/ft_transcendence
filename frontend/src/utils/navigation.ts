
export function navigate(path: string): void {
	history.pushState({}, "", path);
	window.dispatchEvent(new CustomEvent('navigateTo', { detail: path }));
}

export function assignButtonNavigation(buttonName: string, path: string): void {
	document.getElementById(buttonName)?.addEventListener("click", () => navigate(path));
}
