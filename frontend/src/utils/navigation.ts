
export function navigate(event: Event, path: string): void {
	event.preventDefault();
	history.pushState({}, "", path);
	window.dispatchEvent(new CustomEvent('navigateTo', { detail: path }));
}

export function assignButtonNavigation(buttonName: string, path: string): void {
	document.getElementById(buttonName)?.addEventListener("click", (event) => {
		navigate(event, path);
	});
}
