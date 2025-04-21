import Page from "./Page"
import * as lib from "../utils"
import sidebar from "../components/sidebar"

class Profile extends Page {
	constructor() {
		super("profile", '/profile');
	}
	onMount(): void {
		// Set up the image selector
		if (lib.userInfo.profileImage)
			(document.getElementById('profile-image') as HTMLImageElement).src = lib.userInfo.profileImage;
		document.getElementById('profile-image-button')?.addEventListener('click', async (e: Event) => {
			e.preventDefault();
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = 'image/*';
			input.addEventListener('change', async (event) => {
				const file = (event.target as HTMLInputElement).files?.[0];
				console.log(file);
				if (file) {
					const reader = new FileReader();
					reader.onload = () => {
						lib.userInfo.profileImage = reader.result as string;
						const profileImage = document.getElementById('profile-image') as HTMLImageElement;
						profileImage.src = lib.userInfo.profileImage;
						lib.showToast.green("Profile image updated successfully!");
					};
					reader.readAsDataURL(file);

					// Saving the image on dataBase
					try {
						const avatarFormData = new FormData();
						avatarFormData.append('image', file);

						const response = await fetch('http://127.0.0.1:3000/api/user/update/avatar', {
							method: 'POST',
							credentials: "include",
							body: avatarFormData
						});
						if (!response.ok)
							throw new Error(`${response.status} - ${response.statusText}`);

						lib.showToast.green("Imagem salva no servidor!");
					} catch (err) {
						console.error("Erro ao enviar imagem:", err);
						lib.showToast.red("Erro ao salvar a imagem no servidor.");
					}
				}
			});
			input.click();
		});

		//* TEMP
		// document.addEventListener('click', (event: MouseEvent) => {
		// 	const dialogDimensions = document.getElementById('profile-dialog')?.getBoundingClientRect();
		// 	const isBackdropClick =
		// 		event.clientX < dialogDimensions!.left ||
		// 		event.clientX > dialogDimensions!.right ||
		// 		event.clientY < dialogDimensions!.top ||
		// 		event.clientY > dialogDimensions!.bottom;
			
		// 	if (isBackdropClick) {
		// 		window.history.back();
		// 	}
		// });
		(document.getElementById('profile-dialog') as HTMLDialogElement).addEventListener('close', () => window.history.back());
	}
	onCleanup(): void {}
	getHtml(): string {
		return /*html*/`
			<main class="grid flex-1 card t-dashed items-center justify-center">
				<dialog open id="profile-dialog" class="bg-transparent t-dashed fixed top-1/2 left-1/2 -translate-1/2 rounded-xl p-6 w-full max-w-3xl shadow-lg backdrop:bg-blue-500/50">
					<div class="flex">
						<form id="profile" class="card flex flex-col overflow-auto" action="#">
							<h1 class="item text-start text-2xl">Profile</h1>
							<div class="flex">
								<button id="profile-image-button" class="relative size-60 group">
									<img id="profile-image" src="https://picsum.photos/id/237/240" class="rounded-full size-full object-cover border-2 shadow-lg shadow-neutral-400"/>
									<div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
										<i class="fa-solid fa-camera"></i>
									</div>
								</button>
								<div class="flex flex-col justify-center self-center gap-4 ml-20">
									<label class="text-left font-bold" for="profile-username">Username</label>
									<input class="p-1 t-dashed pl-4" type="text" id="profile-username" placeholder="Enter username" value="Sir Barkalot" />
									<label class="text-left font-bold" for="profile-codename">Codename</label>
									<input class="p-1 t-dashed pl-4" type="text" id="profile-codename" placeholder="Enter codename" value="The mighty tail-wagger"/>
									<label class="text-left font-bold" for="profile-email">Email</label>
									<input class="p-1 t-dashed pl-4" type="text" id="profile-email" placeholder="Enter email" value="example@email.com"/>
								</div>
							</div>
							<label class="text-left font-bold" for="profile-bio">Biography</label>
							<textarea class="p-1 t-dashed pl-4" name="bio" id="profile-bio">Champion of belly rubs, fetch, and fierce squirrel chases. Sir Barkalot is the first to answer the doorbell with a royal bark. His hobbies include digging to China and chewing shoes.</textarea>
							<button class="item t-dashed" type="submit">Save</button>
						</form>
						<form method="dialog">
							<button class="mt-4 px-4 py-2">
								<i class="fa-solid fa-xmark fa-xl text-c-secondary size-full"></i>
							</button>
						</form>
					</div>
				</dialog>
			</main>
		`;
	}
	saveProfileInformation() {
		const customElement = document.querySelector('customElement');
		const handler = () => {
		}
		customElement?.addEventListener('submit', handler);
		this.addCleanupHandler(() => customElement?.removeEventListener('submit', handler));
	}
}

const profile: Profile = new Profile();
export default profile;
