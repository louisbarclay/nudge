// eslint-disable-next-line import/no-unassigned-import
import "webext-base-css";
import "./options.css";
import optionsStoragePerDomain from "./options-storage";

const rangeInputs = [
	...document.querySelectorAll<HTMLInputElement>(
		'input[type="range"][name^="color"]',
	),
];
const numberInputs = [
	...document.querySelectorAll<HTMLInputElement>(
		'input[type="number"][name^="color"]',
	),
];
const output = document.querySelector<HTMLElement>(".color-output");

function updateOutputColor() {
	if (output) {
		output.style.backgroundColor = `rgb(${rangeInputs[0].value}, ${rangeInputs[1].value}, ${rangeInputs[2].value})`;
	}
}

function updateInputField(event: Event) {
	const target = event.currentTarget as HTMLInputElement;
	const index = rangeInputs.indexOf(target);
	if (index !== -1) {
		numberInputs[index].value = target.value;
	}
}

for (const input of rangeInputs) {
	input.addEventListener("input", updateOutputColor);
	input.addEventListener("input", updateInputField);
}

async function init() {
	await optionsStoragePerDomain.syncForm("#options-form");
	updateOutputColor();
}

init();
