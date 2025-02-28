
document.addEventListener('keydown', (event: KeyboardEvent) => {
	if (document.activeElement instanceof HTMLInputElement || 
		document.activeElement instanceof HTMLTextAreaElement || 
		(document.activeElement && document.activeElement.getAttribute("contenteditable") === "true")) {
	  return;
	}  
	console.log(`Key pressed: ${event.key}`);
	if (event.key === " ") {
		event.preventDefault();
		const allElements = document.querySelectorAll('*');
		allElements.forEach(element => {
			const htmlElement = element as HTMLElement;
			if (htmlElement.style.outline === '1px solid blue' || htmlElement.style.outlineOffset === '-1px') {
				htmlElement.style.outline = '';
				htmlElement.style.outlineOffset = '';
			} else {
				htmlElement.style.outline = '1px solid blue';
				htmlElement.style.outlineOffset = '-1px';
			}
		});
	}
});

function getCookie(name: string): string | undefined {
	const cookies = document.cookie;
	const cookieArray = cookies.split(';');

	for (let cookie of cookieArray) {
		if (cookie.startsWith(name + '=')) {
			return cookie.substring(name.length + 1);
		}
	}
	return undefined;
}
