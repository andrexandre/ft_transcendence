import Page from "./Page"
import * as lib from "../utils"

class Register extends Page {
	constructor() {
		super("register", '/register');
	}
	onMount(): void {
		this.setSubmissionHandler();
		lib.assignButtonNavigation('goto-login-button', '/login');
		document.getElementById("google-auth-button")!.addEventListener("click", () => {
			window.location.href = `http://${location.hostname}:7000/loginOAuth`;
		});
	}
	onCleanup(): void { }
	getHtml(): string {
		return /*html*/`
			<div class="flex flex-col gap-5 m-auto h-fit card t-dashed">
				<h1 class="text-3xl">Register</h1>
				<form class="space-y-3 flex flex-col" action="#">
					<label for="username">Username</label>
					<input class="item t-dashed pl-4 focus:border-blue-500" type="text" id="username" placeholder="Enter username" required />
					<label for="email">Email</label>
					<input class="item t-dashed pl-4 focus:border-blue-500" type="email" id="email" placeholder="Enter email" required />
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
					<p>Already have an account? <button id="goto-login-button" class="text-blue-700 hover:underline hover:cursor-pointer">Login</button></p>
				</div>
			</div>
		`;
	}
	setSubmissionHandler() {
		const form = document.querySelector('form');
		const handler = async (e: Event) => {
			e.preventDefault();
			const userData: { username: string; password: string; email: string } = {
				username: (document.getElementById('username') as HTMLInputElement).value,
				password: (document.getElementById('password') as HTMLInputElement).value,
				email: (document.getElementById('email') as HTMLInputElement).value
			};
			try {
				const response = await fetch(`http://${location.hostname}:7000/register`, {
					method: 'POST',
					credentials: "include",
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(userData)
				});
				if (!response.ok)
					throw new Error(`${response.status} - ${response.statusText}`);
				lib.showToast.green(`${userData.username} registered successfully`);
				lib.navigate("/login");
			} catch (error) {
				console.log(error);
				lib.showToast.red(error as string);
			}
		};
		form?.addEventListener('submit', handler);
		this.addCleanupHandler(() => form?.removeEventListener('submit', handler));
	}
}

const register: Register = new Register();
export default register;
