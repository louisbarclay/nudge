import optionsStoragePerDomain from "./options-storage";
import { Hider } from "./hider";
import { hideesStore } from "./hidees";

import { Hidee } from "./types";

console.log("💈 Content script loaded for", chrome.runtime.getManifest().name);

// async function init() {
// 	const options = await optionsStoragePerDomain.getOptionsForOrigin().getAll();
// }

const menuPrefix = "hider-menu";
const menuHtmlString = `<div class="hider-menu-container"><div class="hider-menu-content"><div class="hider-menu-dropdown"><div class="hider-menu-dropdown-content" style="display:none"><div class="hider-menu-button-small" id="hider-show-once">Show Section</div><div class="hider-menu-link" id="hider-show-always">Always</div></div></div></div></div>`;
// Set menuClass
const menuClass = `${menuPrefix}-container`;

async function getCurrentDomain() {
	return new URL(window.location.href).hostname;
}

const domains = ["x.com", "linkedin.com"];
function currentDomain(hostname: string) {
	return domains.find((domain) => {
		return hostname.includes(domain);
	});
}

new Hider(
	{
		log: true,
		hidees: hideesStore,
		excludedHidees: [],
		menuClass,
		menuCss: "hider-menu.css",
		menuHtmlString,
		supportLink: "",
		hider_invisibility: false,
	},
	currentDomain(window.location.hostname) || "nodomain.com",
	() => {
		console.log("ey");
	},
	() => {
		console.log("oh");
	},
	"nudge",
);

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

// // Function to highlight element
// function highlightElement(element: HTMLElement): void {
// 	if (currentHighlightedElement) {
// 		removeHighlight();
// 	}
// 	createOverlay(element);
// 	currentHighlightedElement = element;
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
