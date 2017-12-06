function createNudge(response) {
  console.log(response);
  document.addEventListener("DOMContentLoaded", function() {
    addCSS("nudges", "css/nudges.css");
    var nudge = createEl(document.body, "div", "nudge");
    nudge.innerHTML = response;
    var time = document.getElementsByClassName("nudge-highlight")[0];
    liveUpdater(time);
  });
}

// sendHTMLRequest(getUrl('html/nudges/time.html'), createNudge);

function liveUpdater(element) {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "debug_updater") {
      if (element) {
        element.innerHTML = logMinutes(request.total);
      }
    }
  });
}

document.onkeyup = function(key) {
  if (key.keyCode === 27) {
    deleteEl(nudge);
  }
};