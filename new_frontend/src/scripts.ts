
function setSubmissionHandler(url: string): void {
	document.querySelector('form')?.addEventListener('submit', async (e: Event) => {
		e.preventDefault();
		const userData: { username: string; password: string; email?: string } = {
			username: (document.getElementById('username') as HTMLInputElement).value,
			password: (document.getElementById('password') as HTMLInputElement).value
		};
		if (url.includes('register')) {
			userData.email = (document.getElementById('email') as HTMLInputElement).value;
		}

		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(userData)
			});
			if (!response.ok) {
				throw new Error('During the submission of the form');
			}

			const data = await response.json();
			console.log('Success:', data);
			showToast(true, null);
			// if (url.includes('register')) {
			// 	window.location.href = 'login.html';
			// } else {
			// 	window.location.href = 'dashboard.html';
			// }
		} catch (error) {
			console.error(error);
			if (error instanceof Error) {
				showToast(false, error.message);
			} else {
				showToast(false, 'An unknown error occurred');
			}
		}
	});
}

function showToast(success: boolean, message: string | null): void {
	const toast = document.getElementById('toast-default') as HTMLElement;
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
		toast.style.borderColor = 'black';
		toast.style.color = 'black';
		toast.style.backgroundColor = 'white';
		toast.textContent = 'Toasted!';
		toast.style.opacity = '0';
	}, 3000);
}

console.log(`scripts.js imported at ${(new Date()).toLocaleTimeString()}`);
