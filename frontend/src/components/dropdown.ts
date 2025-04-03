import * as lib from "../utils"

const dropdown = {
	getHtml: (componentId: string) => /*html*/`
		<div class="text-left my-1 flex flex-col w-full">
			<button id="dropdownButton-${componentId}" class="flex justify-between items-center game-component !m-0">
				${componentId}
				<i class="fa-solid fa-chevron-down"></i>
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
			const icon = document.querySelector(`#dropdownButton-${componentId} i`);
			icon?.classList.toggle("fa-chevron-up");
			icon?.classList.toggle("fa-chevron-down");
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
    .accordion-icon {
      transition: transform 0.2s ease;
    }
  </style>
</head>
<body>
  <div data-accordion>
    <h2>
      <button type="button"
              data-accordion-target="#panel1"
              aria-expanded="false">
        Accordion Header
        <!-- The icon will rotate when toggled -->
        <svg data-accordion-icon class="accordion-icon" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <polyline points="1,3 5,7 9,3" stroke="black" fill="none"/>
        </svg>
      </button>
    </h2>
    <div id="panel1" class="hidden">
      <p>This is the accordion content. It can include any HTML elements.</p>
    </div>
  </div>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      // Find all buttons that control accordion panels
      const accordionButtons = document.querySelectorAll('[data-accordion-target]');

      accordionButtons.forEach(button => {
        button.addEventListener('click', () => {
          // Get the corresponding content panel using the selector from the data attribute
          const targetSelector = button.getAttribute('data-accordion-target');
          const targetPanel = document.querySelector(targetSelector);

          // Check if the accordion is expanded
          const isExpanded = button.getAttribute('aria-expanded') === 'true';
          // Toggle the aria-expanded attribute
          button.setAttribute('aria-expanded', !isExpanded);

          // Toggle the hidden class to show/hide the panel
          if (targetPanel) {
            targetPanel.classList.toggle('hidden', isExpanded);
          }

          // Rotate the icon based on the state
          const icon = button.querySelector('[data-accordion-icon]');
          if (icon) {
            icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
          }
        });
      });
    });
  </script>
</body>
</html>
 */