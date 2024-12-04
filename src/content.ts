import optionsStoragePerDomain from "./options-storage";
import { Hider } from "./hider";
import { hideesStore } from "./hidees";
import browser from "webextension-polyfill";

// console.log("💈 Content script loaded for", chrome.runtime.getManifest().name);

init();

async function init() {
	const options = await optionsStoragePerDomain.getOptionsForOrigin().getAll();

	const menuHtmlString = `<div class="hider-container"><div class="hider-menu" id="hider-button">Show Section</div></div>`;
	// Set menuClass
	const menuClass = `hider-container`;

	// Find all hidee domains
	const hideeDomains = [...new Set(hideesStore.map((hidee) => hidee.domain))];

	// Function to identify which hidee domain we are on
	function currentDomain(hostname: string): string | false {
		return hideeDomains.find((domain) => hostname.includes(domain)) || false;
	}

	const domain = currentDomain(window.location.hostname);

	if (domain) {
		console.log("Adding hider");
		new Hider(
			{
				log: true,
				hidees: hideesStore,
				// FIXME: I hate the JSON.parse here
				excludedHidees: JSON.parse(options.excludedHidees),
				noMenuHidees: JSON.parse(options.noMenuHidees),
				menuClass,
				menuCss: "hider-menu.css",
				menuHtmlString,
				hider_invisibility: false,
			},
			domain,
			() => {},
			"nudge",
		);
	}
}
