// Copyright 2016, Nudge, All rights reserved.

var messageContents = false;

$(document).ready(function() {
  // bar();
});

function bar() {
  var nudge_uf = createEl(document.body, 'div', 'nudge_uf');
    nudge_uf.innerHTML =
        '<div id="uf_container">' +
          '<div id="uf_message">' +
            '<div id="uf_message_contents">' +
              'The other bar' +
            '</div>' +
          '</div>' +
      '</div>';
  messageContents = document.getElementById('uf_message_contents');
  return messageContents;
}

function barChangeText(newText) {
  if (messageContents) {
    messageContents.innerHTML = newText;    
  }
}