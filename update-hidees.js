// update-hidees.js
import fs from "fs";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const googleSheetConfig = {
	baseUrl:
		"https://script.google.com/macros/s/AKfycbzvjy-Zj0wzX6aCfBmWWtSMU1jwZc6l_7lKKf8pyygLyqwRgf1Tfz2l6rKnUz81KB8c/exec",
	spreadsheetId: "1Y-xQb1qRgnicD_0M-8REXKbSPi4lnsQW7lqUqh52fiw",
	sheetName: "Hidden Sections",
};

// Define URL for request
const params = new URLSearchParams({
	spreadsheetId: googleSheetConfig.spreadsheetId,
	sheetName: googleSheetConfig.sheetName,
});
const url = googleSheetConfig.baseUrl + "?" + params;

// Simplify logging
const log = console.log.bind(console);
const hideesLocation = "src/hidees.ts";

// This will make sure we do an initial check
let currentHidees = false;

// Start checking for sheet updates
log("Initialising Google Sheet checker");
checkHidees();

// If updating frequently, uncomment this
// setInterval(checkHidees, 60000)

async function checkHidees() {
	const sheetRequest = await fetch(url);
	const sheetData = await sheetRequest.json();
	const rows = sheetData.values;

	if (rows.length) {
		log("Connecting to Google Sheet");
		let hidees = [];
		// Get row headers
		const keys = rows[0];

		// Exclude row headers
		rows.forEach((row, index) => {
			if (index > 0) {
				let hidee = {};
				row.forEach((columnValue, index) => {
					// Clean column values
					if (columnValue) {
						if (keys[index].includes("hideeStyle.")) {
							if (!hidee.style) {
								hidee.style = {};
							}
							hidee.style[keys[index].replace("hideeStyle.", "")] = columnValue;
						} else if (keys[index].includes("buttonStyle.")) {
							if (!hidee.buttonStyle) {
								hidee.buttonStyle = {};
							}
							hidee.buttonStyle[keys[index].replace("buttonStyle.", "")] =
								columnValue;
						} else {
							columnValue = cleanValue(columnValue);
							hidee[keys[index]] = columnValue;
						}
					}
				});
				// Make a hidee style object if there is none
				if (!hidee.style) {
					hidee.style = {};
				}
				// Make a hidee style object if there is none
				if (!hidee.buttonStyle) {
					hidee.buttonStyle = {};
				}
				if (hidee.import) {
					delete hidee.import;
					hidees.push(hidee);
				}
			}
		});

		// If current hidees is false (initial state) or not the same as new hidees, write new file
		if (!currentHidees || currentHidees.length !== hidees.length) {
			// Set current hidees
			currentHidees = hidees;
			fs.writeFile(
				hideesLocation,
				`import { Hidee } from "./types";
        export const hideesStore: Hidee[] =  ${JSON.stringify(hidees)}`,
				function (err) {
					if (err) return console.log(err);
					console.log(`Saved new hidees from Google Sheet`);
				},
			);
		} else {
			log("No new hidees on Google Sheet");
		}
	} else {
		console.log("No data found.");
	}
}

// Util
const cleanValue = (columnValue) => {
	if (columnValue === "TRUE") {
		return true;
	}
	if (columnValue === "FALSE") {
		return false;
	}
	return columnValue;
};
