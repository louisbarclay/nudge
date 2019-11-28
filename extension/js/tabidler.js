function checkVideo() {
  return !!Array.prototype.find.call(
    document.querySelectorAll("video"),
    function(elem) {
      return elem.duration > 0 && !elem.paused
    }
  )
}

var enableLog = false

function idleLog(message) {
  if (enableLog) {
    log(message)
  }
}

idleLog("watching for activity")

function inactivityTime() {
  var idle = false
  var t
  // DOM Events
  document.onmousemove = function() {
    resetTimer("onmousemove")
  }
  document.onkeypress = function() {
    resetTimer("onkeypress")
  }
  document.onmousedown = function() {
    resetTimer("onmousedown") // touchscreen presses
  }
  document.ontouchstart = function() {
    resetTimer("ontouchstart")
  }
  document.onclick = function() {
    resetTimer("onclick") // touchpad clicks
  }
  document.onscroll = function() {
    resetTimer("onscroll") // scrolling with arrow keys
  }
  function idleStart() {
    if (checkVideo()) {
      resetTimer("oncheckvideo")
    } else {
      idle = true
      chrome.runtime.sendMessage({ type: "tabIdle", status: true }, function(
        response
      ) {})
      idleLog("gone tab idle")
    }
  }

  function resetTimer(source) {
    idleLog(source)
    if (idle) {
      idle = false
      chrome.runtime.sendMessage({ type: "tabIdle", status: false }, function(
        response
      ) {})
      idleLog("back from tab idle")
    }
    clearTimeout(t)
    t = setTimeout(idleStart, 60000)
  }
}

inactivityTime()
