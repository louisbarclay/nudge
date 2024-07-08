import optionsStoragePerDomain from "./options-storage";
import { Hider } from "./hider";
import { hideesStore } from "./hidees";

import { Hidee } from "./types";

console.log("💈 Content script loaded for", chrome.runtime.getManifest().name);

// async function init() {
// 	const options = await optionsStoragePerDomain.getOptionsForOrigin().getAll();
// }

const menuPrefix = "hider-menu";
let menuFile = `${menuPrefix}.html`;
const menuHtmlString = `<div class="hider-menu-container"><div class="hider-menu-content"><div class="hider-menu-dropdown"><div class="hider-menu-dropdown-content" style="display:none"><div class="hider-menu-button-small" id="hider-show-once">Show Section</div><div class="hider-menu-link" id="hider-show-always">Always</div></div></div></div></div>`;
// Set menuClass
const menuClass = `${menuPrefix}-container`;

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
	"x.com",
	() => {
		console.log("ey");
	},
	() => {
		console.log("oh");
	},
	"nudge",
);

// init();
