import lib from "../lib"
import Page from "./Page"

class Login extends Page {
	constructor() {
		super("login", '/login');
	}
	onMount(): void {
		this.setSubmissionHandler('/login');
	}
	onCleanup(): void {}
	getHtml(): string {
		return /*html*/`
			<div class="m-auto h-fit max-w-xs p-9 bg-white border border-gray-200 rounded-lg shadow-sm">
				<form class="space-y-6" action="#">
					<h5 class="text-center text-3xl font-medium text-gray-900">Login</h5>
					<div>
						<label for="username" class="block mb-2 text-sm font-medium text-gray-900">Username</label>
						<input type="text" id="username" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Enter username" required />
					</div>
					<div>
						<label for="password" class="block mb-2 text-sm font-medium text-gray-900">Password</label>
						<input type="password" id="password" placeholder="Enter password" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required />
					</div>
					<button type="submit" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Submit</button>
					<div class="text-sm font-medium text-gray-500">
						Not registered? 
						<button id="register-button" class="text-blue-700 hover:underline hover:cursor-pointer">Create account</button>
						<p>Want to login? <button id="dashboard-button" class="text-blue-700 hover:underline hover:cursor-pointer">Go to Dashboard</button>
						</p>
					</div>
				</form>
			</div>
		`;
	}
	setSubmissionHandler(url: string) {
		const form = document.querySelector('form');
		const handler = async (e: Event) => {
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
					credentials: "include",
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(userData)
				});
				if (!response.ok) {
					throw new Error(`${response.status} - ${response.statusText}`);
				}
				lib.showToast(true, `${response.status} - ${response.statusText}`);
			} catch (error) {
				console.log(error);
				lib.showToast(false, error as string);
			}
		};
		form?.addEventListener('submit', handler);
		this.addCleanupHandler(() => form?.removeEventListener('submit', handler));
	}
}

const login: Login = new Login();
export default login;
