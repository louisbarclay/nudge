// Copyright 2016, Nudge, All rights reserved.

$(document).ready(function() {
  listener(debuggerInit());
});

function debuggerInit() {
  var nudge_db = createEl(document.body, 'div', 'nudge_db');
    nudge_db.innerHTML =
        '<div id="db_container">' +
          '<div id="db_message">' +
            '<div id="db_message_contents">' +
              'Loading...' +
            '</div>' +
          '</div>' +
      '</div>';
  var messageContents = document.getElementById('db_message_contents');
  return messageContents;
}

function listener(element) {
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
    if (request.type === "debug_updater") {
      if (element) {
        element.innerHTML = request.domain + ' | Now: ' + logMinutes(request.runningCounter) + ' | Total: ' + logMinutes(request.total) + ' | Before: ' + logMinutes(request.before/1000) + ' | Visits: ' + request.visits + ' | Time per visit: ' + logMinutes((request.total)/request.visits);
      }
    }
  });
}

$(document).keyup(function(key) {
  var db_container = document.getElementById('db_container');
  if (key.keyCode === 27) {
    deleteEl(db_container);
  }
});