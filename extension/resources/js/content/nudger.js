var cssRequest = {};
var nudgeRequest = {};
var cssId = "nudges";

function addCSS() {
  if (!document.getElementById(cssId)) {
    var head = document.getElementsByTagName("head")[0];
    var link = document.createElement("link");
    link.id = cssId;
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = chrome.extension.getURL("css/nudges.css");
    link.media = "all";
    head.appendChild(link);
  }
}

function sendHTMLRequest() {
  var url = chrome.extension.getURL("html/main-nudge.html");
  nudgeRequest = $.ajax({
    url,
    dataType: "html",
    success: createNudge
  });
}

function createNudge() {
  console.log(document.body);
  document.addEventListener("DOMContentLoaded", function() {
    addCSS();
    var nudge = createEl(document.body, "div", "nudge");
    var nudgeHTML = nudgeRequest.responseText;
    nudge.innerHTML = nudgeHTML;
    var time = document.getElementsByClassName("nudge-highlight")[0];
    liveUpdater(time);
  });
}

sendHTMLRequest();

function liveUpdater(element) {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "debug_updater") {
      if (element) {
        element.innerHTML = logMinutes(request.total);
      }
    }
  });
}

$(document).keyup(function(key) {
  if (key.keyCode === 27) {
    deleteEl(nudge);
  }
});
