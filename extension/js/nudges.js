
var quarterClass = ".nudge-quarter";
var quarterStyle = `{ height: ${100}px !important; width: ${100}px !important; }`;
var quarterSize = false;
quarterSize = document.getElementById("quarter-size");
if (!quarterSize) {
  styleAdder(quarterClass, quarterStyle, "quarter-size");
} else {
  quarterSize.innerHTML = quarterClass + quarterStyle;
}