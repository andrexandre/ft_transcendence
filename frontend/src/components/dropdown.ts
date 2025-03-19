import * as lib from "../utils"

const dropdown = {
	getHtml: (componentId: string) => /*html*/`
		<div class="text-left my-1 w-50">
			<button id="dropdownButton-${componentId}" class="flex justify-between px-5 items-center w-full shadow-sm py-2 border-2 border-light hover:border-darker">
				${componentId}
				<i class="fa-solid fa-chevron-down"></i>
			</button>

			<div id="dropdownMenu-${componentId}" class="hidden flex-col"></div>
		</div>
	`,
	setDropdownToggler: (componentId: string) => {
		const button = document.getElementById(`dropdownButton-${componentId}`);
		const menu = document.getElementById(`dropdownMenu-${componentId}`);
		const handler = () => {
			menu?.classList.toggle('hidden');
			menu?.classList.toggle('flex');
			const icon = document.querySelector(`#dropdownButton-${componentId} i`);
			icon?.classList.toggle("fa-chevron-up");
			icon?.classList.toggle("fa-chevron-down");
		}
		button?.addEventListener('click', handler);
	},
	addOption: (componentId: string, optionText: string, onClickHandler: () => void) => {
		const option = document.createElement('button');
		option.className = 'm-1 px-4 py-2 border-2 border-light hover:border-darker';
		option.textContent = optionText;
		option.addEventListener('click', onClickHandler);
		document.getElementById(`dropdownMenu-${componentId}`)?.appendChild(option);
	}
}

export default dropdown;
