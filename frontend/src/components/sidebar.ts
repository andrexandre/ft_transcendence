import * as lib from "../utils"

const sidebar = {
	getHtml: () => /*html*/`
		<aside id="sidebar" class="dash-component transition-all p-3 w-[200px]">
			<ul id="sidebar-list" class="sidebar-list">
				<li>
					<button id="hide-button" class="sidebar-component">
						<i class="fa-solid fa-arrow-left"></i>
						<p>Hide</p>
					</button>
				</li>
				<li>
					<button id="home-button" class="sidebar-component">
						<i class="fa-solid fa-home"></i>
						<p>Home</p>
					</button>
				</li>
				<li>
					<button id="chat-button" class="sidebar-component">
						<i class="fa-solid fa-message"></i>
						<p>Chat</p>
					</button>
				</li>
				<li>
					<button id="game-button" class="sidebar-component">
						<i class="fa-solid fa-gamepad"></i>
						<p>Game</p>
					</button>
				</li>
				<li>
					<button id="notifications-button" class="sidebar-component">
						<i class="fa-solid fa-bell"></i>
						<p>Notifications</p>
					</button>
				</li>
				<li>
					<button id="link-to-chat-button" class="sidebar-component">
						<i class="fa-solid fa-comment-dots"></i>
						<p>Link to chat</p>
					</button>
				</li>
				<li>
					<button id="link-to-game-button" class="sidebar-component">
						<i class="fa-solid fa-link"></i>
						<p>Link to game</p>
					</button>
				</li>
				<li class="mt-auto">
					<button id="logout-button" class="sidebar-component">
						<i class="fa-solid fa-right-from-bracket"></i>
						<p>Logout</p>
					</button>
					<button id="settings-button" class="sidebar-component">
						<i class="fa-solid fa-gear"></i>
						<p>Settings</p>
					</button>
				</li>
			</ul>
		</aside>
	`,
	setSidebarToggler: () => {
		const sidebar = document.getElementById('sidebar');
		const sidebarList = document.getElementById('sidebar-list');
		const closeButton = document.getElementById('hide-button');

		const handler = () => {
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
		}
		closeButton?.addEventListener('click', handler);

		lib.assignButtonNavigation('home-button', '/');
		lib.assignButtonNavigation('chat-button', '/chat');
		document.getElementById("link-to-chat-button")!.addEventListener("click", () => {
			window.location.href = "http://127.0.0.1:2000/";
		});
		lib.assignButtonNavigation('game-button', '/game');
		document.getElementById("notifications-button")!.addEventListener("click", () => {
			lib.showToast();
		});
		document.getElementById("link-to-game-button")!.addEventListener("click", () => {
			window.location.href = "http://127.0.0.1:5000/";
		});
		document.getElementById("logout-button")!.addEventListener("click", () => {
			const Logout = async () => {
				try {
					const response = await fetch('http://127.0.0.1:7000/logout', {
						credentials: 'include',
					});
					if (!response.ok) {
						throw new Error(`${response.status} - ${response.statusText}`);
					}
					lib.showToast.green(`${response.status} - ${response.statusText}`);
					lib.navigate('/login');
				} catch (error) {
					console.log(error);
					lib.showToast.red(error as string);
				}
			}
			Logout()
		});
		lib.assignButtonNavigation('settings-button', '/login');
	}
}

export default sidebar;
