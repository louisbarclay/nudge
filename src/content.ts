import optionsStoragePerDomain from "./options-storage";
import { Hider } from "./hider";
import { hideesStore } from "./hidees";

// Import any font that you need
import "@fontsource/inter/latin-400.css";

// console.log("💈 Content script loaded for", chrome.runtime.getManifest().name);

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

const domains = ["x.com", "linkedin.com", "mail.google.com"];
function currentDomain(hostname: string) {
	return domains.find((domain) => {
		return hostname.includes(domain);
	});
}

console.log("here");

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
