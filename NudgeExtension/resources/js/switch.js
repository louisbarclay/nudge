// Copyright 2016, Nudge, All rights reserved.


$(document).ready(function() {
  switchOff();
});

// image caching because svg arrives too late!

function switchOff() {
  var nudge_s = createEl(document.body, 'div', 'nudge_s');
    nudge_s.innerHTML =
      '<div id="s_container">' +
        '<div id="s_switch">' +
        '</div>' +
        '<div id="s_message">' +
          '<div id="s_message_contents">' +
            'Switch off this site' +
          '</div>' +
        '</div>' +
      '</div>';
  $("#nudge_s").on('click', '#s_container', function() {
      var s_message_contents = document.getElementById('s_message_contents');
      var s_message = document.getElementById('s_message');
      s_message.style.maxWidth = "350px";
      s_message_contents.innerHTML = "Switching off in 3";
      function in2() {
        s_message_contents.innerHTML = "Switching off in 2";
      }
      function in1() {
        s_message_contents.innerHTML = "Switching off in 1";
      }
      function in0() {
        s_message_contents.innerHTML = "Switching off...";
      }
      setTimeout(in2, 1000);
      setTimeout(in1, 2000);
      setTimeout(in0, 3000);
      setTimeout(initOff, 3000);
    }
  );    
}

function initOff() {
  chrome.runtime.sendMessage({
    type: "off"
  });
}

// http://liveweave.com/oedF0V

// store URL that the user was ATTEMPTING to go to in the JS for the newly loaded 'off' page