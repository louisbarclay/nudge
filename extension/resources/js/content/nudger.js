sendHTMLRequest(getUrl("html/nudges/time.html"), storeForUse);
sendHTMLRequest(getUrl("html/nudges/compulsive.html"), storeForUse);

doAtEarliest(function() {
  addCSS("nudges", "css/nudges.css");
});

// Wait for favicon to come from message
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(request);
  var alreadyNudged = document.getElementById('#nudge');
  if (!alreadyNudged) {
    if (request.type === "time") {
      console.log(request.amount);
      createTimeNudge(request.amount);
      sendResponse({ time_executed: moment(), status: "succeeded" });
    }
    if (request.type === "compulsive") {
      createCompulsiveNudge(request.amount);
      sendResponse({ time_executed: moment(), status: "succeeded" });
    }
  }
  if (request.type === "ready_check") {
    sendResponse({ type: "ready" });
  }
  if (request.type === "favicon") {
    imageLoader("favicon", request.favicon);
    if (!keyDefined(tempStorage, "faviconUrl")) {
      tempStorage.faviconUrl = request.favicon;
    } else if (tempStorage.faviconUrl.includes(`${request.domain}/favicon`)) {
      // Always upgrade to a non-'domain.com/favicon' string if possible, since likely to be better quality
      tempStorage.faviconUrl = request.favicon;
    }
  }
});

function setFavicon() {
  document.getElementById("nudge-favicon").style.background = `url(${
    tempStorage.faviconUrl
  }) center center/32px no-repeat`;
}

function createTimeNudge(time) {
  var nudge = createEl(document.body, "div", "nudge");
  nudge.innerHTML = tempStorage["time.html"];
  setFavicon();
  var timeText = document.querySelector("#nudge-highlight");
  timeText.innerHTML = minutes(time);
  function increaseTime() {
    time++;
    timeText.innerHTML = minutes(time);
  }
  setInterval(increaseTime, 1000);
}

function createCompulsiveNudge(time) {
  // doAtEarliest(function() {
  //   addCSS("nudge-compulsive", "css/pages/compulsive.css");
  // });
  var nudge = createEl(document.body, "div", "nudge");
  nudge.innerHTML = tempStorage["compulsive.html"];
  setFavicon();
  var timeText = document.querySelector("#nudge-highlight");
  timeText.innerHTML = logMinutes(time);
  function increaseTime() {
    time++;
    timeText.innerHTML = logMinutes(time);
  }
  setInterval(increaseTime, 1000);
}

document.onkeyup = function(key) {
  if (key.keyCode === 27) {
    if (notUndefined(nudge)) {
      deleteEl(nudge);
    }
  }
};
