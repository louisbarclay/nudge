import optionsStoragePerDomain from "./options-storage";
import { Hider } from "./hider";
import { hideesStore } from "./hidees";

import { Hidee } from "./types";

// console.log("💈 Content script loaded for", chrome.runtime.getManifest().name);

// async function init() {
// 	const options = await optionsStoragePerDomain.getOptionsForOrigin().getAll();
// }

const hiddenElementSelectors = [
	'[data-finite-scroll-hotkey-context="FEED"]',
	"#feed-news-module",
];

const checkHeadExistence = setInterval(() => {
	if (document.head) {
		clearInterval(checkHeadExistence);
		console.log("doc head exists");
		hiddenElementSelectors.map((selector) => {
			let style = document.createElement("style");
			style.innerHTML = `${selector}{display: none !important;}`;
			style.id = "anicestyle";
			document.head.appendChild(style);
		});
	}
}, 50);

const menuPrefix = "hider-menu";
const menuHtmlString = `<div class="hider-menu-container"><div class="hider-menu-content"><div class="hider-menu-dropdown"><div class="hider-menu-dropdown-content" style="display:none"><div class="hider-menu-button-small" id="hider-show-once">Show Section</div><div class="hider-menu-link" id="hider-show-always">Always</div></div></div></div></div>`;
// Set menuClass
const menuClass = `${menuPrefix}-container`;

async function getCurrentDomain() {
	return new URL(window.location.href).hostname;
}

// const domains = ["x.com", "linkedin.com"];
// function currentDomain(hostname: string) {
// 	return domains.find((domain) => {
// 		return hostname.includes(domain);
// 	});
// }

// new Hider(
// 	{
// 		log: true,
// 		hidees: hideesStore,
// 		excludedHidees: [],
// 		menuClass,
// 		menuCss: "hider-menu.css",
// 		menuHtmlString,
// 		supportLink: "",
// 		hider_invisibility: false,
// 	},
// 	currentDomain(window.location.hostname) || "nodomain.com",
// 	() => {
// 		console.log("ey");
// 	},
// 	() => {
// 		console.log("oh");
// 	},
// 	"nudge",
// );

// function getClassSelector(element: Element | null | undefined): string {
// 	// Early exit if no element provided
// 	if (!element || !element.className) {
// 		return "";
// 	}

// 	// Get classes as a string, handling both string and SVGAnimatedString cases
// 	const classString: string =
// 		typeof element.className === "string"
// 			? element.className
// 			: (element.className as SVGAnimatedString).baseVal || "";

// 	// Split classes, handling multiple spaces, tabs, and newlines
// 	const classes = classString
// 		.split(/[\s\n\t]+/)
// 		.filter((className: string): boolean => {
// 			// Filter out empty strings and invalid class names
// 			if (!className) return false;

// 			// Basic validation of class names according to CSS spec
// 			// Must begin with a letter, underscore, or hyphen
// 			// Can contain letters, digits, hyphens, and underscores
// 			return /^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$/.test(className);
// 		})
// 		.map((className: string): string => {
// 			// Escape special characters in class names
// 			return className.replace(/([!"#$%&'()*+,./:;<=>?@[\]^`{|}~])/g, "\\$1");
// 		});

// 	// Join classes with dots to create a valid CSS selector
// 	return classes.length ? "." + classes.join(".") : "";
// }

// // Variable to keep track of the currently highlighted element
// let currentHighlightedElement: HTMLElement | null = null;
// let overlay: HTMLElement | null = null;

// // Function to create and position the overlay
// function createOverlay(element: HTMLElement): void {
// 	if (overlay) {
// 		document.body.removeChild(overlay);
// 	}

// 	overlay = document.createElement("div");
// 	const rect = element.getBoundingClientRect();

// 	Object.assign(overlay.style, {
// 		position: "fixed",
// 		zIndex: "10000",
// 		pointerEvents: "none",
// 		backgroundColor: "rgba(255, 192, 203, 0.5)", // Semi-transparent pink
// 		border: "2px solid rgba(255, 105, 180, 0.8)", // Stronger pink border
// 		boxSizing: "border-box",
// 		transition: "all 0.3s",
// 		top: `${rect.top + window.scrollY}px`,
// 		left: `${rect.left + window.scrollX}px`,
// 		width: `${rect.width}px`,
// 		height: `${rect.height}px`,
// 	});

// 	document.body.appendChild(overlay);
// }

// // Function to determine best identification strategy
// function determineIdentificationStrategy(element: HTMLElement): {
// 	type: string;
// 	selector: string;
// } {
// 	// Check for ID
// 	if (element.id) {
// 		const similarIds = document.querySelectorAll(`#${element.id}`);
// 		if (similarIds.length === 1) {
// 			return {
// 				type: "ID",
// 				selector: `#${element.id}`,
// 			};
// 		}
// 	}

// 	// Check for unique data attributes
// 	for (const attr of element.attributes) {
// 		if (attr.name.startsWith("data-")) {
// 			const selector = `[${attr.name}="${attr.value}"]`;
// 			const elements = document.querySelectorAll(selector);
// 			if (elements.length === 1) {
// 				return {
// 					type: "Data Attribute",
// 					selector,
// 				};
// 			}
// 		}
// 	}

// 	// Check for unique class combination
// 	if (element.className) {
// 		const classSelector = getClassSelector(element);
// 		console.log(classSelector);
// 		const elements = document.querySelectorAll(classSelector);
// 		if (elements.length === 1) {
// 			return {
// 				type: "Class",
// 				selector: classSelector,
// 			};
// 		}
// 	}

// 	// Fallback to structure-based selector
// 	const parent = element.parentElement;
// 	if (parent) {
// 		const index = Array.from(parent.children).indexOf(element) + 1;
// 		const parentSelector = parent.id
// 			? `#${parent.id}`
// 			: parent.tagName.toLowerCase();
// 		return {
// 			type: "Structural",
// 			selector: `${parentSelector} > ${element.tagName.toLowerCase()}:nth-child(${index})`,
// 		};
// 	}

// 	// Ultimate fallback
// 	return {
// 		type: "Tag",
// 		selector: element.tagName.toLowerCase(),
// 	};
// }

// // Function to highlight element
// function highlightElement(element: HTMLElement): void {
// 	if (currentHighlightedElement) {
// 		removeHighlight();
// 	}
// 	createOverlay(element);
// 	currentHighlightedElement = element;

// 	// Get and log identification strategy
// 	const strategy = determineIdentificationStrategy(element);
// 	console.log({
// 		strategy: strategy.type,
// 		selector: strategy.selector,
// 	});
// }
// // Function to remove highlight
// function removeHighlight(): void {
// 	if (overlay && overlay.parentNode) {
// 		overlay.parentNode.removeChild(overlay);
// 	}
// 	overlay = null;
// 	currentHighlightedElement = null;
// }

// // Interface for element information
// interface ElementInfo {
// 	id: string;
// 	class: string;
// 	parentId: string;
// 	parentClass: string;
// 	tagName: string;
// 	firstChildId: string;
// 	firstChildClass: string;
// 	innerText: string;
// }

// // Function to log element information
// function logElementInfo(element: HTMLElement): void {
// 	const parent = element.parentElement;
// 	const firstChild = element.firstElementChild as HTMLElement | null;

// 	const info: ElementInfo = {
// 		id: element.id || "N/A",
// 		class: element.className || "N/A",
// 		parentId: parent ? parent.id || "N/A" : "N/A",
// 		parentClass: parent ? parent.className || "N/A" : "N/A",
// 		tagName: element.tagName,
// 		firstChildId: firstChild ? firstChild.id || "N/A" : "N/A",
// 		firstChildClass: firstChild ? firstChild.className || "N/A" : "N/A",
// 		innerText:
// 			element.innerText.slice(0, 50) +
// 			(element.innerText.length > 50 ? "..." : ""),
// 	};

// 	console.log(info);
// }

// // Function to highlight parent element
// function highlightParent(): void {
// 	if (currentHighlightedElement && currentHighlightedElement.parentElement) {
// 		highlightElement(currentHighlightedElement.parentElement);
// 		logElementInfo(currentHighlightedElement.parentElement);
// 	}
// }

// // Add event listeners to all elements
// document.addEventListener(
// 	"mouseover",
// 	(event: MouseEvent) => {
// 		const target = event.target as HTMLElement;
// 		highlightElement(target);
// 		logElementInfo(target);
// 	},
// 	true,
// );

// document.addEventListener(
// 	"mouseout",
// 	(event: MouseEvent) => {
// 		removeHighlight();
// 	},
// 	true,
// );

// // Add keydown event listener to the document
// document.addEventListener("keydown", (event: KeyboardEvent) => {
// 	if (event.key === "ArrowUp" && currentHighlightedElement) {
// 		event.preventDefault(); // Prevent default scroll behavior
// 		highlightParent();
// 	}
// });

// // Update overlay position on scroll and resize
// window.addEventListener("scroll", () => {
// 	if (currentHighlightedElement) {
// 		createOverlay(currentHighlightedElement);
// 	}
// });

// window.addEventListener("resize", () => {
// 	if (currentHighlightedElement) {
// 		createOverlay(currentHighlightedElement);
// 	}
// });
