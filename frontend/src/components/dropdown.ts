import * as lib from "../utils"

const dropdown = {
	getHtml: (componentId: string) => /*html*/`
		<div class="text-left my-1 flex flex-col w-full">
			<button id="dropdownButton-${componentId}" class="item t-border m-0">
				${componentId}
			</button>

			<div id="dropdownMenu-${componentId}" class="hidden flex-col"></div>
		</div>
	`,
	initialize: (componentId: string, optionalHandler?: () => void) => {
		const button = document.getElementById(`dropdownButton-${componentId}`);
		const menu = document.getElementById(`dropdownMenu-${componentId}`);
		const handler = () => {
			menu?.classList.toggle('hidden');
			menu?.classList.toggle('flex');
			const lobby = document.getElementById('lobby');
			if (!lobby?.classList.contains('hidden') && !optionalHandler)
				lobby?.classList.toggle('hidden');
		}
		button?.addEventListener('click', handler);
		if (optionalHandler) {
			button?.addEventListener('click', optionalHandler);
		}
	},
	addElement: (elementId: string, elementName: string, elementClasses: string, elementHtml: string, elementOnClickHandler?: () => void) => {
		const component = document.createElement(elementName);
		component.className = elementClasses + ' border-orange-700 hover:border-orange-500';
		component.innerHTML = elementHtml;
		if (elementOnClickHandler)
			component.addEventListener('click', elementOnClickHandler);
		document.getElementById(`dropdownMenu-${elementId}`)?.appendChild(component);
	}
}

export default dropdown;
