// eslint-disable-next-line import/no-unassigned-import
import "./options-storage.js";

// src/background.ts
import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener(() => {
	console.log("Installed!");
});
