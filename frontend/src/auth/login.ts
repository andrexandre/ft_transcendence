
const login = () => {
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
					Not registered? <a href="register.html" class="text-blue-700 hover:underline">Create account</a>
					<p>Want to login? <a href=".." class="text-blue-700 hover:underline">Go to Dashboard</a>
					</p>
				</div>
			</form>
		</div>
	`;
};

export default login;
