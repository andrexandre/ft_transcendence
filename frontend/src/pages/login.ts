import Page from "./Page"
import * as lib from "../utils"

class Login extends Page {
	constructor() {
		super("login", '/login');
	}
	onMount(): void {
		this.setSubmissionHandler();
		lib.assignButtonNavigation('goto-register-button', '/register');
		lib.assignButtonNavigation('goto-dashboard-button', '/');
		document.getElementById("google-auth-button")!.addEventListener("click", () => {
			window.location.href = "http://127.0.0.1:7000/loginOAuth";
		});
	}
	onCleanup(): void { }
	getHtml(): string {
		return /*html*/`
			<div class="flex flex-col gap-5 m-auto h-fit card t-dashed">
				<h1 class="text-3xl">Login</h1>
				<form class="space-y-3 flex flex-col" action="#">
					<label for="username">Username</label>
					<input class="item t-dashed pl-4 focus:border-blue-500" type="text" id="username" placeholder="Enter username" required />
					<label for="password">Password</label>
					<input class="item t-dashed pl-4 focus:border-blue-500" type="password" id="password" placeholder="Enter password" required />
					<button class="item t-dashed focus:outline-none focus:border-blue-500" type="submit">Submit</button>
				</form>
				<hr class="text-c-primary">
				<button class="item t-dashed focus:outline-none focus:border-blue-500" id="google-auth-button">
					<i class="fa-brands fa-google mr-2"></i>
					Continue with Google
				</button>
				<div class="text-sm font-medium text-c-secondary">
					<p>Not registered? <button id="goto-register-button" class="text-blue-700 hover:underline hover:cursor-pointer">Create account</button></p>
					<p>Want to login? <button id="goto-dashboard-button" class="text-blue-700 hover:underline hover:cursor-pointer">Go to Dashboard</button></p>
				</div>
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
				const response = await fetch('http://127.0.0.1:80/login', {
					method: 'POST',
					credentials: "include",
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(userData)
				});
				if (!response.ok) {
					throw new Error(`${response.status} - ${response.statusText}`);
				}
				lib.navigate("/");
			} catch (error) {
				console.log(error);
				lib.showToast.red(error as string);
			}
		};
		form?.addEventListener('submit', handler);
		this.addCleanupHandler(() => form?.removeEventListener('submit', handler));
	}
}

const login: Login = new Login();
export default login;
