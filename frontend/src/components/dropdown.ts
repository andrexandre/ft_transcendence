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
	addComponent: (componentId: string, componentName: string, componentClasses: string, html: string, onClickHandler?: () => void) => {
		const component = document.createElement(componentName);
		component.className = componentClasses;
		component.innerHTML = html;
		if (onClickHandler)
			component.addEventListener('click', onClickHandler);
		document.getElementById(`dropdownMenu-${componentId}`)?.appendChild(component);
	}
}

export default dropdown;
