// Send message to player.js
function messageSender(object) {
  console.log(currentState.domain);
  console.log(object);
  if (
    currentState.domain === notInChrome ||
    currentState.domain === chromeOrTabIdle ||
    currentState.domain === inChromeFalseDomain
  ) {
    console.log("never sent");
    return;
  } else {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(
      tabs
    ) {
      // Send message to the tab here
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "ready_check" }, function(
          response
        ) {
          if (response && response.type) {
            chrome.tabs.sendMessage(tabs[0].id, object, function(response) {
              if (response) {
                object.time_executed = response.time_executed;
                object.status = response.status;
                object.tabId = tabs[0].id;
                lastSuccessfulNudgeTime = response.time_executed; // TODO: this stuff is all too heavy. The handler below should cover it
                nudgeLogger(object);
              } else if (object.send_fails < sendFailLimit) {
                object.send_fails++;
                messageSender(object);
              } else {
                object.status = "failed";
                nudgeLogger(object);
              }
            });
          } else {
            // If tab record is undefined, create it
            tabIdStorage[tabs[0].id].nudge = object;
            object.send_fails++;
            // so...... load the tab ID with the nudge to come (the whole object!)
            // then the every-seconder asks the current selected tab if there is a nudge waiting, in which case it messageSends
          }
        });
      }
    });
  }
}

// URL receiver from content script and init options giver
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === "event") {
    console.log(request);
    eventLogReceiver(request);
  }
  if (request.type === "off") {
    var domain = inDomainsSetting(sender.url);
    if (domain) {
      changeSetting("domains", domain, "off", true);
      switchOff(domain, sender.url, sender.tabId);
    }
  }
  if (request.type === "on") {
    var domain = request.domain;
    if (domain) {
      var url = request.url;
      console.log(url);
      changeSetting("domains", domain, "off", false);
      switchOn(domain, request.url, sender.tabId);
    }
  }
  if (
    request.type === "scroll" ||
    request.type === "visit" ||
    request.type === "compulsive" ||
    request.type === "time"
  ) {
    messageSender(request);
  }
  if (request.type === "player_init") {
    sendResponse({ domain: inDomainsSetting(request.url) });
  }
  if (request.type === "options") {
    chrome.runtime.openOptionsPage();
  }
  if (request.type === "domains_add") {
    changeSetting(true, "domains", request.domain, "add");
    log(request);
  }
  if (request.type === "domains_remove") {
    changeSetting(false, "domains", request.domain, "nudge");
    log(request);
  }
  if (request.type === "fun_name") {
    sendResponse({ name: randomGetter(funNames_init, funNames_current) });
  }
  var chromeTab = sender.tab.url.includes("chrome-extension:");
  if (request.type === "inject_switch" && !chromeTab) {
    chrome.tabs.executeScript(sender.tab.id, {
      file: "resources/js/switch.js"
    });
    chrome.tabs.executeScript(sender.tab.id, {
      file: "resources/js/player.js"
    });
    if (true) {
      chrome.tabs.executeScript(sender.tab.id, {
        file: "resources/js/debugger.js"
      });
    }
  }
  if (request.type === "inject_fbunfollow" && !chromeTab) {
    chrome.tabs.executeScript(sender.tab.id, {
      file: "resources/js/facebook/unfollow.js"
    });
  }
  if (request.type === "inject_fbhide" && !chromeTab) {
    chrome.tabs.insertCSS(sender.tab.id, {
      file: "resources/css/fbtweaks.css",
      runAt: "document_start"
    });
  }
  if (request.type === "inject_tabidler" && !chromeTab) {
    chrome.tabs.executeScript(sender.tab.id, {
      file: "resources/js/tabidler.js"
    });
  }
  if (request.type === "tabIdle") {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(
      tabs
    ) {
      if (typeof tabs[0] != "undefined" && tabs[0].id === sender.tab.id) {
        var domain = inDomainsSetting(sender.url);
        onTabIdle(request.status, domain);
      }
    });
  }
});
