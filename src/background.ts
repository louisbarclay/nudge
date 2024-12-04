// eslint-disable-next-line import/no-unassigned-import
import "./options-storage.js";

// src/background.ts
import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener((details) => {
	console.log("Installation details:", details);
	console.log("Installation reason:", details.reason);

	if (details.reason === "install") {
		console.log("Fresh install detected - should open step1");
		browser.tabs.create({
			url: browser.runtime.getURL("src/start/start.html#step1"),
		});
	} else if (details.reason === "update") {
		const currentVersion = browser.runtime.getManifest().version;
		const previousVersion = details?.previousVersion;
		console.log("Update detected:", { currentVersion, previousVersion });

		if (previousVersion !== currentVersion) {
			browser.tabs.create({
				url: browser.runtime.getURL("src/start/start.html#welcome"),
			});
		}
	}
});
