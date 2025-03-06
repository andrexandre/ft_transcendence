
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

function showToast(success: boolean, message: string | null): void {
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
