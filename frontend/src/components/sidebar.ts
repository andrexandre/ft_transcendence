import * as lib from "../utils"

const sidebar = {
	getHtml: () => /*html*/`
		<aside id="sidebar" class="card t-dashed transition-all p-3 w-50">
			<ul id="sidebar-list" class="flex flex-col h-full">
				<li>
					<button id="hide-sidebar-button" class="sidebar-component">
						<i class="fa-solid fa-arrow-left"></i>
						<p>Hide</p>
					</button>
				</li>
				<li>
					<button id="goto-home-button" class="sidebar-component">
						<i class="fa-solid fa-home"></i>
						<p>Home</p>
					</button>
				</li>
				<li>
					<button id="goto-chat-button" class="sidebar-component">
						<i class="fa-solid fa-message"></i>
						<p>Chat</p>
					</button>
				</li>
				<li>
					<button id="goto-game-button" class="sidebar-component">
						<i class="fa-solid fa-gamepad"></i>
						<p>Game</p>
					</button>
				</li>
				<li>
					<button id="test-notifications-button" class="sidebar-component">
						<i class="fa-solid fa-bell"></i>
						<p>Notifications</p>
					</button>
				</li>
				<li class="mt-auto">
					<button id="logout-button" class="sidebar-component">
						<i class="fa-solid fa-right-from-bracket"></i>
						<p>Logout</p>
					</button>
					<button id="goto-settings-button" class="sidebar-component">
						<i class="fa-solid fa-gear"></i>
						<p>Settings</p>
					</button>
				</li>
			</ul>
		</aside>
	`,
	setSidebarToggler: (buttonName?: string) => {
		if (buttonName == 'home' || buttonName == 'chat' || buttonName == 'game' || buttonName == 'settings') {
			document.getElementById(`goto-${buttonName}-button`)?.classList.add('bg-c-secondary');
		}
		document.getElementById('hide-sidebar-button')!.addEventListener('click', () => {
			const sidebar = document.getElementById('sidebar');
			const sidebarList = document.getElementById('sidebar-list');
			const pElements = sidebar?.querySelectorAll('p');
			if (!sidebar || !sidebarList)
				return lib.showToast.red();
			pElements?.forEach(p => {
				if (p.style.display === 'none') {
					p.previousElementSibling?.classList.replace('fa-bars', 'fa-arrow-left');
					sidebar.style.width = '200px';
					p.style.display = 'block';
					sidebarList.classList.remove('place-items-center');
				} else {
					p.previousElementSibling?.classList.replace('fa-arrow-left', 'fa-bars');
					sidebar.style.width = '70px';
					p.style.display = 'none';
					sidebarList.classList.add('place-items-center');
				}
			});
		});
		lib.assignButtonNavigation('goto-home-button', '/');
		lib.assignButtonNavigation('goto-chat-button', '/chat');
		lib.assignButtonNavigation('goto-game-button', '/game');
		document.getElementById("test-notifications-button")!.addEventListener("click", () => lib.showToast());
		document.getElementById("logout-button")!.addEventListener("click", () => {
			(async () => {
				try {
					const response = await fetch('http://127.0.0.1:7000/logout', {
						credentials: 'include',
					});
					if (!response.ok) {
						throw new Error(`${response.status} - ${response.statusText}`);
					}
					lib.showToast.green(`${response.status} - ${response.statusText}`);
					lib.navigate('/login');
					lib.userInfo.username = '';
					lib.userInfo.userId = '';
					lib.userInfo.auth_method = '';
				} catch (error) {
					console.log(error);
					lib.showToast.red(error as string);
				}
			})();
		});
		lib.assignButtonNavigation('goto-settings-button', '/settings');
	}
}

export default sidebar;
