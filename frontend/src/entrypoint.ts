
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
			} else {
				htmlElement.style.outline = '1px solid blue';
				htmlElement.style.outlineOffset = '-1px';
			}
		});
	}
});
