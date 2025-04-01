
export function navigate(path: string, event?: Event): void {
	if (event)
		event.preventDefault();
	history.pushState({}, "", path);
	window.dispatchEvent(new CustomEvent('navigateTo', { detail: path }));
}

export function assignButtonNavigation(buttonName: string, path: string): void {
	document.getElementById(buttonName)?.addEventListener("click", (event) => {
		navigate(path, event);
	});
}
