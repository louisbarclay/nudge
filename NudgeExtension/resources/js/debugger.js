// Copyright 2016, Nudge, All rights reserved.


$(document).ready(function() {
  listener(debuggerInit());
});

// image caching because svg arrives too late!

function debuggerInit() {
  var nudge_db = createEl(document.body, 'div', 'nudge_db');
    nudge_db.innerHTML =
      '<div id="db_container">' +
        '<div id="db_message">' +
          '<div id="db_message_contents">' +
          '</div>' +
        '</div>' +
      '</div>';    
  var messageContents = document.getElementById('db_message_contents');
  return messageContents;
}

console.log(messageContents);

function listener(element) {
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
    if (request.type === "debug_updater") {
      if (element) {
        element.innerHTML = logMinutes(request.startTime/1000) + ' before, ' + 'now ' + logMinutes(request.currentTime) + '. ' + request.visits + ' visits.';
      }
    }
  });
}