eventLog("background.js loaded", "startup");

function everySecond() {
  // Run the counter on the current domain
  domainTimeNudger();
  // Don't do anything else if currently idle
  if (currentState.domain === chromeOrTabIdle) {
    return;
  }
  // Don't do anything if no windows exist
  chrome.windows.getAll(null, function(windows) {
    if (windows.length === 0) {
      if (currentState.domain !== notInChrome) {
        timeline(notInChrome, "everySecond");
        return;
      }
    } else {
      // Find out if there are any windows active, and if so grab the active tab
      chrome.windows.getLastFocused({ populate: true }, function(window) {
        // If no windows are focused, check if notInChrome, and if not, add notInChrome to timeline
        if (!window.focused) {
          if (currentState.domain !== notInChrome) {
            timeline(notInChrome, "everySecond");
            return;
          }
        } else {
          // If a window is focused, find the active tab
          var foundActiveTab = false;
          for (var i = 0; i < window.tabs.length; i++) {
            // Once found active tab, check if currentState is notInChrome, and if it is, add domain to timeline
            if (window.tabs[i].active) {
              foundActiveTab = true;
              if (currentState.domain === notInChrome) {
                var domain = false;
                domain = inDomainsSetting(window.tabs[i].url);
                timeline(domain, "everySecond");
              }
              // Check if there is a nudge waiting to go out on the active tab
              if (tabIdStorage[window.tabs[i].id].nudge) {
                if (
                  nudge.type === "compulsive" &&
                  currentState.source !== "tabs.onActivated" // fuck need to check this.
                ) {
                  messageSender(nudge);
                  console.log("stopped broken nudge"); // ask the question - did facebook already exist? or something like that
                } else {
                  messageSender(nudge);
                }
                tabIdStorage[tabs[0].id].nudge = false;
              }
            }
          }
          if (!foundActiveTab) {
            console.log("Did not find an active tab");
          }
        }
      });
    }
  });
}

function onTabIdle(status, domain) {
  if (status) {
    timeline(chromeOrTabIdle, "onTabIdle");
  } else {
    timeline(domain, "onTabIdle");
  }
}

// Creates a timeline event (or object, same thing)
function timelineObject(domain, source) {
  return {
    time: timeNow(),
    domain: domain,
    source: source
  };
}

// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason == "install") {
    eventLog("install", "install"); // seems weird
  } else if (details.reason == "update") {
    var thisVersion = chrome.runtime.getManifest().version;
    eventLog(details.reason, details.reason, {
      previousVersion: details.previousVersion,
      thisVersion
    });
  }
});

// Tab closed, and tell about shutdown
chrome.tabs.onRemoved.addListener(function(tabId) {
  if (typeof tabIdStorage[tabId] === undefined) {
    return;
  } else {
    var tabRecord = tabIdStorage[tabId];
    var domain = inDomainsSetting(tabRecord.url);
    if (domain) {
      chrome.tabs.query({}, function(tabs) {
        if (tabsChecker(tabs, domain)) {
          var statusObj = open("status");
          var time = timeNow();
          statusObj = dataAdder(statusObj, domain, time, "lastShutdown");
          var nudged = false;
          if (
            keyDefined(statusObj, domain) &&
            keyDefined(statusObj[domain], "lastNudged")
          ) {
            // untested
            var timeSinceLastNudged = time - statusObj[domain];
            if (timeSinceLastNudged < 60000) {
              nudged = true;
            }
          }
          eventLog(domain, "shutdown", { nudged });
          close("status", statusObj);
        }
      });
    }
    delete tabIdStorage[tabId];
  }
});

// Helper function to check if any tabs match domain
function tabsChecker(tabs, domain) {
  // log(tabs);
  for (var i = 0; i < tabs.length; i++) {
    if (inDomainsSetting(tabs[i].url) === domain) {
      return false;
    }
  }
  return true;
}

// When Chrome window closed
chrome.windows.onRemoved.addListener(function(windowId) {
  chrome.windows.getAll(null, function(windows) {
    if (windows.length === 0) {
      timeline(notInChrome, "chrome.windows.onRemoved");
    }
  });
});

// Add to timeline onStateChanged
chrome.idle.onStateChanged.addListener(function(newState) {
  if (newState !== "active") {
    // switching this part off because onTabIdle can handle it on its own
    timelineAdder(false, "Gone idle zZZzZzZZ");
  }
  if (newState === "active") {
    chrome.windows.getLastFocused(function(window) {
      if (typeof window == "undefined" || window.focused === false) {
        timeline(false, "idle.onStateChanged");
      } else {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(
          tabs
        ) {
          var domain = inDomainsSetting(tabs[0].url);
          timeline(domain, "idle.onStateChanged");
        });
      }
    });
  }
});

// Add to timeline onActivated
chrome.tabs.onActivated.addListener(function(activatedTab) {
  if (typeof activatedTab == "undefined") {
    return;
  }
  chrome.tabs.get(activatedTab.tabId, function(tabDetails) {
    // Don't need check of whether tab is active, because it is by default
    var domain = inDomainsSetting(tabDetails.url);
    timeline(domain, "tabs.onActivated");
  });
});

// Add to timeline window onFocusedChange
chrome.windows.onFocusChanged.addListener(function(windowId) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
    var domain = false;
    if (typeof tabs[0] != "undefined") {
      domain = inDomainsSetting(tabs[0].url);
      timeline(domain, "windows.onFocusedChanged");
    }
  });
});

// Add to tabIdStorage onCreated
chrome.tabs.onCreated.addListener(function(tab) {
  // New record in tabIdStorage
  tabIdStorage[tab.id] = {
    url: tab.url,
    nudge: false
  };
});

// Add to timeline onUpdated
// Update URL in tabIdStorage
// URL constantiser
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  var domain = inDomainsSetting(tab.url);
  if (domain in settingsLocal.domains && settingsLocal.domains[domain]["off"]) {
    switchOff(domain, tab.url, tabId);
  }
  // Update record in tabIdStorage
  if (typeof tabIdStorage[tabId] === "undefined") {
    tabIdStorage[tabId] = {
      url: tab.url,
      nudge: false
    };
  } else {
    tabIdStorage[tabId].url = tab.url;
  }
  if (tab.active === true) {
    chrome.windows.get(tab.windowId, function(Window) {
      if (Window.focused) {
        timeline(domain, "tabs.onUpdated");
      }
    });
  }
  // For constantising titles
  if (domain && changeInfo.title) {
    chrome.tabs.sendMessage(
      tabId,
      {
        type: "title",
        title: changeInfo.title,
        domain: domain
      },
      function(response) {}
    );
  }
  // For sending favicon URL
  if (
    domain &&
    typeof changeInfo.favIconUrl !== "undefined" &&
    changeInfo.favIconUrl !== ""
  ) {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(
      tabs
    ) {
      if (typeof tabs[0] !== undefined) {
        chrome.tabs.sendMessage(
          tabId,
          {
            type: "favicon",
            favicon: tab.favIconUrl,
            domain: domain
          },
          function(response) {}
        );
      }
    });
  }
});

// chrome.runtime.setUninstallURL("http://userstyles.org/uninstall/chrome");
