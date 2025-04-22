import * as lib from "../utils"

const sidebar = {
	getHtml: () => /*html*/`
		<aside id="sidebar" class="card t-dashed transition-all p-3 w-50">
			<ul id="sidebar-list" class="flex flex-col h-full gap-1">
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
					<button id="goto-profile-button" class="sidebar-component">
						<i class="fa-solid fa-circle-user"></i>
						<p>Profile</p>
					</button>
				</li>
				<!--* Important comment for testing -->
				<!-- <li class="flex">
					<button id="test-default-notifications-button" class="sidebar-component">
						<i class="fa-solid fa-bell"></i>
					</button>
					<p>
						<span class="flex flex-row size-full">
							<button id="test-green-notifications-button" class="sidebar-component !p-2.5">
								<i class="fa-solid fa-bell text-green-500"></i>
							</button>
							<button id="test-red-notifications-button" class="sidebar-component !p-2.5">
								<i class="fa-solid fa-bell text-red-500"></i>
							</button>
							<button id="test-blue-notifications-button" class="sidebar-component !p-2.5">
								<i class="fa-solid fa-bell text-blue-500"></i>
							</button>
							<button id="test-yellow-notifications-button" class="sidebar-component !p-2.5">
								<i class="fa-solid fa-bell text-yellow-500"></i>
							</button>
						</span>
					</p>
				</li> -->
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
		if (buttonName == 'home' || buttonName == 'chat' || buttonName == 'game' || buttonName == 'settings' || buttonName == 'profile') {
			document.getElementById(`goto-${buttonName}-button`)?.classList.add('bg-c-secondary');
			document.getElementById(`goto-${buttonName}-button`)?.classList.add('dark:bg-c-primary');
		}
		document.getElementById('hide-sidebar-button')!.addEventListener('click', () => {
			const sidebar = document.getElementById('sidebar')!;
			const sidebarList = document.getElementById('sidebar-list')!;
			const pElements = sidebar?.querySelectorAll('p');
			if (pElements?.[0].style.display == 'none') {
				sidebar.style.width = '200px',
				sidebarList.classList.remove('place-items-center'),
				lib.Cookies.remove('sidebarClosed')
			} else {
				sidebar.style.width = '70px',
				sidebarList.classList.add('place-items-center'),
				lib.Cookies.set('sidebarClosed', 'true')
			}
			pElements?.forEach(p => {
				if (p.style.display === 'none') {
					p.previousElementSibling?.classList.replace('fa-bars', 'fa-arrow-left');
					p.style.display = 'block';
				} else {
					p.previousElementSibling?.classList.replace('fa-arrow-left', 'fa-bars');
					p.style.display = 'none';
				}
			});
		});
		if (lib.Cookies.get('sidebarClosed'))
			document.getElementById('hide-sidebar-button')!.click();
		lib.assignButtonNavigation('goto-home-button', '/');
		lib.assignButtonNavigation('goto-chat-button', '/chat');
		lib.assignButtonNavigation('goto-game-button', '/game');
		lib.assignButtonNavigation('goto-profile-button', '/profile');
		lib.assignButtonNavigation('goto-settings-button', '/settings');
		//* Important comment for testing
		// document.getElementById("test-default-notifications-button")!.addEventListener("click", () => lib.showToast());
		// document.getElementById("test-green-notifications-button")!.addEventListener("click", () => lib.showToast.green());
		// document.getElementById("test-red-notifications-button")!.addEventListener("click", () => lib.showToast.red());
		// document.getElementById("test-blue-notifications-button")!.addEventListener("click", () => lib.showToast.blue());
		// document.getElementById("test-yellow-notifications-button")!.addEventListener("click", () => lib.showToast.yellow());
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
	}
}

export default sidebar;
