sendHTMLRequest(getUrl("html/nudges/time.html"), storeForUse);
sendHTMLRequest(getUrl("html/nudges/compulsive.html"), storeForUse);

doAtEarliest(function() {
  addCSS("nudges", "css/nudges.css");
});

// Wait for favicon to come from message
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var alreadyNudged = document.getElementById("nudge");
  if (!alreadyNudged) {
    if (request.type === "time") {
      console.log("TIME NUDGE", request);
      createTimeNudge(request.amount, request.domain);
      sendResponse({ time_executed: moment(), status: "succeeded" });
    }
    if (request.type === "compulsive") {
      console.log("COMPULSIVE NUDGE", request);
      createCompulsiveNudge(request.amount);
      sendResponse({ time_executed: moment(), status: "succeeded" });
    }
  }
  if (request.type === "ready_check") {
    console.log(request.type);
    sendResponse({ type: "ready" });
  }
});

function setFavicon() {
  var favicon = document.getElementById("nudge-favicon");
  if (favicon)
    favicon.style.background = `url(${
      tempStorage.faviconUrl
    }) center center/32px no-repeat`;
}

function createTimeNudge(time, domain) {
  var nudge = createEl(document.body, "div", "nudge");
  nudge.innerHTML = tempStorage["time.html"];
  // setInterval(setFavicon, 1000);
  setFavicon();
  var timeText = document.getElementById("nudge-time");
  timeText.innerHTML = logMinutes(time);
  function increaseTime() {
    time++;
    timeText.innerHTML = logMinutes(time);
  }
  function makePink() {
    toggleClass(timeText, "nudge-pink");
  }
  setInterval(increaseTime, 1000);
  // setTimeout(deleteNudge, 15000);
  // Only delete if mouse hasn't been over
  var close = document.getElementById("close-button");
  var options = document.getElementById("nudge-options");
  var domainText = document.getElementById("nudge-domain");
  domainText.innerHTML = domain;
  options.onclick = function() {
    sendMessage("options", {});
  };
  if (close) {
    close.onclick = function() {
      deleteNudge();
    };
  }
}

// docReady(function() {
//   createTimeNudge(1000);
// });

function createCompulsiveNudge(time) {
  // doAtEarliest(function() {
  //   addCSS("nudge-compulsive", "css/pages/compulsive.css");
  // });
  var nudge = createEl(document.body, "div", "nudge");
  nudge.innerHTML = tempStorage["compulsive.html"];
  setInterval(setFavicon, 1000);
  var timeText = document.getElementById("nudge-time");
  console.log(time);
  var interval = moment().diff(time, "seconds");
  console.log(interval);
  var humanise = moment.duration(interval, "seconds").humanize();
  console.log(humanise);
  timeText.innerHTML = humanise;
  setTimeout(deleteNudge, 10000);
}

// document.onkeyup = function(key) {
//   if (key.keyCode === 27) {
//     console.log('deleted because of key up');
//     deleteNudge();
//   }
// };

function deleteNudge() {
  var nudge = document.getElementById("nudge");
  if (nudge) {
    deleteEl(nudge);
  }
}
