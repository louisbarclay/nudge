var time = document.getElementsByClassName("nudge-highlight")[0];

timeSet();

setInterval(timeSet, 1000);

function timeSet() {
  time.innerHTML = epochToMinSec(timeNow());
}

// var canChangeText = true;

// time.onmouseenter = function() {
//   canChangeText = false;
//   time.innerHTML = "Don't Nudge";
// };

// time.onmouseout = function() {
//   canChangeText = true;
//   timeSet();
// };
