import * as lib from "./"

export function navigate(path: string) {
	history.pushState({}, "", path);
	window.dispatchEvent(new CustomEvent('navigateTo', { detail: path }));
}

export function assignButtonNavigation(buttonName: string, path: string) {
	document.getElementById(buttonName)?.addEventListener("click", () => navigate(path), { once: true });
}

export async function executeLogout() {
	try {
		const response = await fetch(`http://${location.hostname}:8080/service/logout`, {
			credentials: 'include',
		});
		if (!response.ok)
			throw new Error(`${response.status} - ${response.statusText}`);
		lib.toggleUserServices(false);
		lib.showToast(`Logged out successfully`);
		sessionStorage.clear();
		lib.navigate('/login');
		lib.userInfo.username = "";
		lib.userInfo.userId = "";
		lib.userInfo.auth_method = "";
	} catch (error) {
		console.log(error);
		lib.showToast.red(error as string);
	}
}
