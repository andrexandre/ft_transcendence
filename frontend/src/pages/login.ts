import Page from "./Page"
import * as lib from "../utils"

class Login extends Page {
	constructor() {
		super("login", '/login');
	}
	onMount(): void {
		this.setSubmissionHandler();
		lib.assignButtonNavigation('goto-register-button', '/register');
		document.getElementById("google-auth-button")!.addEventListener("click", () => {
			window.location.href = `http://${location.hostname}:7000/loginOAuth`;
		});
		document.getElementById("2fa-code")!.addEventListener("input", async (event) => {
			const input = (event.target as HTMLInputElement);
			if (input.value.length === 6) {
				try {
					const response = await fetch(`http://${location.hostname}:8080/2fa/verify-google-authenticator`, {
						method: 'POST',
						credentials: "include",
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ totpCode: input.value })
					});
					if (!response.ok)
						throw new Error(`${response.status} - ${response.statusText}`);
					lib.toggleUserServices(true);
					lib.showToast(`Logged in successfully`);
					lib.navigate("/");
				} catch (error) {
					console.log(error);
					lib.showToast.red(`2FA verification failed`);
				}
			}
		});
	}
	onCleanup(): void { }
	getHtml(): string {
		return /*html*/`
			<main class="flex flex-col gap-5 m-auto h-fit card t-dashed">
				<h1 class="text-3xl">Login</h1>
				<form class="space-y-3 flex flex-col" action="#">
					<label for="username">Username</label>
					<input class="item t-dashed pl-4 focus:border-blue-500" type="text" id="username" placeholder="Enter username" required autofocus minlength="3" maxlength="15" pattern="^[^<>]+$" />
					<label for="password">Password</label>
					<input class="item t-dashed pl-4 focus:border-blue-500" type="password" id="password" placeholder="Enter password" required minlength="3" pattern="^[^<>]+$" />
					<button class="item t-dashed focus:outline-none focus:border-blue-500" type="submit">Submit</button>
				</form>
				<hr class="text-c-primary">
				<button class="item t-dashed focus:outline-none focus:border-blue-500" id="google-auth-button">
					<i class="fa-brands fa-google mr-2"></i>
					Continue with Google
				</button>
				<div class="text-sm font-medium text-c-secondary">
					<p>Not registered? <button id="goto-register-button" class="text-blue-700 hover:underline hover:cursor-pointer">Create account</button></p>
				</div>
			</main>
			<div id="2fa" class="hidden flex-col w-100 m-auto card t-dashed">
				<h1 class="text-3xl">2-Step Verification</h1>
				<p>To help keep your account safe, <s>mommy</s> wants to make sure it's really you trying to sign in</p>
				<img src="https://ssl.gstatic.com/accounts/embedded/device_prompt_tap_yes_darkmode.gif">
				<label for="2fa-code"></label>
				<input class="item t-dashed pl-4 focus:border-blue-500" type="text" id="2fa-code" placeholder="Enter code" maxlength="6" required pattern="^[0-9]+$" />
			</div>
		`;
	}
	setSubmissionHandler() {
		const form = document.querySelector('form');
		const handler = async (e: Event) => {
			e.preventDefault();
			const userData: { username: string; password: string; } = {
				username: (document.getElementById('username') as HTMLInputElement).value,
				password: (document.getElementById('password') as HTMLInputElement).value
			};
			try {
				const response = await fetch(`http://${location.hostname}:7000/login`, {
					method: 'POST',
					credentials: "include",
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(userData)
				});
				if (!response.ok)
					throw new Error((await response.json()).message);
				const response2fa = await fetch(`http://${location.hostname}:8080/api/users/${userData.username}/two-fa-status`);

				if (!response2fa.ok)
					throw new Error((await response2fa.json()).message);
				if ((await response2fa.json()).status) {
					document.getElementsByTagName("main")[0]?.classList.remove("flex");
					document.getElementsByTagName("main")[0]?.classList.add("hidden");
					document.getElementById("2fa")?.classList.remove("hidden");
					document.getElementById("2fa")?.classList.add("flex");
					return;
				}
				lib.toggleUserServices(true);
				lib.showToast(`Logged in successfully`);
				lib.navigate("/");
			} catch (error: any) {
				console.log(error);
				lib.showToast.red(error.message);
			}
		};
		form?.addEventListener('submit', handler);
		this.addCleanupHandler(() => form?.removeEventListener('submit', handler));
	}
}

const login: Login = new Login();
export default login;
