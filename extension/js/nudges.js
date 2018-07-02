
var numberOfSecs = 0;
var quarterPx = Math.round(107 + numberOfSecs / 60 * 5);
var quarterClass = ".nudge-quarter";
var quarterStyle = `{ height: ${quarterPx}px !important; width: ${quarterPx}px !important; }`;
var quarterSize = false;
quarterSize = document.getElementById("quarter-size");
if (!quarterSize) {
  styleAdder(quarterClass, quarterStyle, "quarter-size");
} else {
  quarterSize.innerHTML = quarterClass + quarterStyle;
}

// var cornerClass = ".nudge-corner";
// var cornerStyle = `{ right: ${3}px !important; }`;
// styleAdder(cornerClass, cornerStyle, "edge-size");