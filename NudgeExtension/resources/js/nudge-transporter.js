console.log("transporter here");

var nudgeRequest = {};

function sendRequest() {
  var nudgeUrl = chrome.extension.getURL("html/main-nudge.html");
  nudgeRequest = $.ajax({
    url: nudgeUrl,
    dataType: "html",
    success: createNudge
  });
}

function createNudge() {
  console.log(document.body);
  document.addEventListener("DOMContentLoaded", function() {
    var nudge = createEl(document.body, "div", "nudge");
    var nudgeHTML = nudgeRequest.responseText;
    nudge.innerHTML = nudgeHTML;
    console.log(nudge);
  });
}

sendRequest();