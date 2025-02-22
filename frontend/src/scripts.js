function setSubmissionHandler(url) {
	document.querySelector('form').addEventListener('submit', async (e) => {
		e.preventDefault();
		const userData = {
			username: document.getElementById('username').value,
			password: document.getElementById('password').value,
			email
		};
		if (url.includes('register')) {
			userData.email = document.getElementById('email').value;
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
			console.log('Response:', data);
			showToast(true, null);
			// if (url.includes('register')) {
			// 	window.location.href = 'login.html';
			// } else {
			// 	window.location.href = 'dashboard.html';
			// }
		} catch (error) {
			console.error(error);
			showToast(false, error);
		}
	});
}

function showToast(success, message) {
	const toast = document.getElementById('toast-default');
	toast.style.opacity = 1;

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
	const displayDuration = 2000;
	const fadeOutDuration = 1000;
	setTimeout(() => {
		// toast.style.borderColor = 'black';
		// toast.style.color = 'black';
		// toast.style.backgroundColor = 'white';
		// toast.textContent = 'Toasted!';
		toast.style.transition = `opacity ${fadeOutDuration}ms`;
		toast.style.opacity = '0';
		// setTimeout(() => {
		// 	toast.remove();
		// }, fadeOutDuration);
		}, displayDuration);
}

console.log(`scripts.js imported at ${(new Date()).toLocaleTimeString()}`);
