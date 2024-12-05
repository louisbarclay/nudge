// eslint-disable-next-line import/no-unassigned-import
import "./options-storage.js";

// src/background.ts
import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener((details) => {
	if (details.reason === "install") {
		browser.tabs.create({
			url: browser.runtime.getURL("src/start/start.html#step1"),
		});
	} else if (details.reason === "update") {
		const currentVersion = browser.runtime.getManifest().version;
		const previousVersion = details?.previousVersion;

		if (previousVersion !== currentVersion) {
			browser.tabs.create({
				url: browser.runtime.getURL("src/start/start.html#welcome"),
			});
		}
	}
});

browser.runtime.setUninstallURL("https://goo.gl/forms/YqSuCKMQhP3PcFz13");
