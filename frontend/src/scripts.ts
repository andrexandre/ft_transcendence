
function setSubmissionHandler(url: string): void {
	document.querySelector('form')?.addEventListener('submit', async (e: Event) => {
		e.preventDefault()
		const userData: { username: string; password: string; email?: string } = {
			username: (document.getElementById('username') as HTMLInputElement).value,
			password: (document.getElementById('password') as HTMLInputElement).value
		}
		if (url.includes('register')) {
			userData.email = (document.getElementById('email') as HTMLInputElement).value
		}
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(userData)
			});
			if (response.status != 201) {
				throw new Error('During the submission of the form');
			}
			showToast(true, null);
			// if (url.includes('register')) {
			// 	window.location.href = 'login.html';
			// } else {
			// 	window.location.href = 'dashboard.html';
			// }			
		}
		catch (error) {
			console.log(error);
			showToast(false, error as string);
		}
	})
}

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

console.log(`js from ts imported at ${(new Date()).toLocaleTimeString()}`);
