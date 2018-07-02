function checkVideo() {
  return !!Array.prototype.find.call(document.querySelectorAll('video'),function(elem) {
    return elem.duration > 0 && !elem.paused;
  });
}

function inactivityTime() {
  var idle = false;
  var t;
  window.onload = resetTimer;
  // DOM Events
  document.onmousemove = resetTimer;
  document.onkeypress = resetTimer;
  document.onmousedown = resetTimer; // touchscreen presses
  document.ontouchstart = resetTimer;
  document.onclick = resetTimer; // touchpad clicks
  document.onscroll = resetTimer; // scrolling with arrow keys
  document.onkeypress = resetTimer;
  function idleStart() {
    if (checkVideo()) {
      resetTimer();
    } else {
      idle = true;
      chrome.runtime.sendMessage({ type: "tabIdle", status: true }, function(response) {
      });      
      // console.log('gone tab idle');
    }
  }

  function resetTimer() {
      if (idle) {
        idle = false;
        chrome.runtime.sendMessage({ type: "tabIdle", status: false }, function(response) {
        });
        // console.log('back from tab idle');
      }
      clearTimeout(t);
      t = setTimeout(idleStart, 60000);
  }
}

inactivityTime();