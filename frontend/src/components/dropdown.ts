import * as lib from "../utils"

const dropdown = {
	getHtml: (componentId: string) => /*html*/`
		<div class="text-left my-1 flex flex-col w-full">
			<button id="dropdownButton-${componentId}" class="flex justify-between items-center game-component !m-0">
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
		component.className = elementClasses;
		component.innerHTML = elementHtml;
		if (elementOnClickHandler)
			component.addEventListener('click', elementOnClickHandler);
		document.getElementById(`dropdownMenu-${elementId}`)?.appendChild(component);
	}
}

export default dropdown;

/* 
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Simple Accordion Example</title>
  <style>
    .hidden {
      display: none;
	}
  </style>
</head>
<body>
  <div data-accordion>
    <h2>
      <button type="button" data-accordion-target="#panel1">Accordion Header</button>
    </h2>
    <div id="panel1" class="hidden">
      <p>This is the accordion content. It can include any HTML elements.</p>
    </div>
  </div>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const accordionButtons = document.querySelectorAll('[data-accordion-target]');

      accordionButtons.forEach(button => {
        button.addEventListener('click', () => {
          const targetSelector = button.getAttribute('data-accordion-target');
          const targetPanel = document.querySelector(targetSelector);

          if (targetPanel)
            targetPanel.classList.toggle('hidden', isExpanded);
        });
      });
    });
  </script>
</body>
</html>
 */