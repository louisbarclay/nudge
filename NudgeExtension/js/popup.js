// what is my domain?

// how much time have i spent on it today? live updates please

// can i please stop this site from being a nudge site?

// can i please undo that change? i.e. toggle?

// can i please have a link to options? surely that's easy

var optionsLink = document.getElementById("options");

console.log(optionsLink);

optionsLink.onclick = function() {
  chrome.runtime.sendMessage({
    type: "options"
  });
};