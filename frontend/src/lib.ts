
document.addEventListener('keydown', (event: KeyboardEvent) => {
	if (event.key === "Enter") {
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
