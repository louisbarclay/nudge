eventLog("background.js loaded", "startup");

function everySecond() {
  // Run the counter on the current domain
  if (testMode) {
    return;
  }
  domainTimeNudger();
  // Don't do anything else if currently idle
  var currentState = checkCurrentState();
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
                var nudge = tabIdStorage[window.tabs[i].id].nudge;
                if (nudge.type === "compulsive") {
                  tabIdStorage[window.tabs[i].id].nudge = false;
                  nudgeSender(nudge);
                } else {
                  tabIdStorage[window.tabs[i].id].nudge = false;
                  nudgeSender(nudge);
                }
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
function timelineObject(domain, source, timeOverride) {
  return {
    time: timeOverride ? moment(timeOverride) : moment(),
    domain: domain,
    source: source,
    lastEverySecond: moment()
  };
}

// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason == "install") {
    eventLog("install", "install"); // seems weird
    // Show options page on install
    showOptionsPage = true;
  } else if (details.reason == "update") {
    var thisVersion = chrome.runtime.getManifest().version;
    eventLog(details.reason, details.reason, {
      previousVersion: details.previousVersion,
      thisVersion
    });
    // Show options page on install
    showOptionsPage = true;
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
        // If no tabs with that domain now exist
        if (tabsChecker(tabs, domain)) {
          var statusObj = open("status");
          // Check lastVisitEnd
          var endTime = statusObj[domain].lastVisitEnd;
          // Check lastShutdown
          var lastShutdown = statusObj[domain].lastShutdown;
          // What does it mean if lastShutdown is undefined?
          // Means you should go ahead and mark that as a shutdown
          // What does it mean if lastVisitEnd is undefined? Should be impossible
          if (lastShutdown !== endTime) {
            dataAdder(statusObj, domain, endTime, "lastShutdown");
            // Shutdown happened so turn off site if you should
            if (settingsLocal.off_by_default) {
              changeSetting(true, "domains", domain, "off");
            }
            close("status", statusObj, "status close in check off");
            eventLog(
              domain,
              "shutdown",
              {},
              moment().format("YYYY-MM-DD"),
              moment(endTime).format("HH:mm:ss")
            );
          }
        }
      });
    }
    delete tabIdStorage[tabId];
  }
});

// Helper function to check if any tabs match domain
// Returns true if there were NO OTHER TABS with that domain
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
    timeline(false, "Gone idle zZZzZzZZ");
  }
  if (newState === "active") {
    // FIXME: is triggering error when only chrome window is the background one
    chrome.windows.getLastFocused(function(window) {
      if (typeof window == "undefined" || window.focused === false) {
        // This may be the problem
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
  try {
    chrome.tabs.get(activatedTab.tabId, function(tabDetails) {
      // Don't need check of whether tab is active, because it is by default
      try {
        var domain = inDomainsSetting(tabDetails.url);
      } catch (e) {
        console.log(e);
        console.log("Couldn't evaluate inDomainsSetting");
      }
      timeline(domain, "tabs.onActivated");
    });
  } catch (e) {
    console.log(e);
  }
});

// Add to timeline window onFocusedChange
chrome.windows.onFocusChanged.addListener(function(windowId) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
    var domain = false;
    if (typeof tabs[0] != "undefined") {
      try {
        domain = inDomainsSetting(tabs[0].url);
      } catch (e) {
        console.log(e);
        console.log("Couldn't evaluate inDomainsSetting");
      }
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
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  try {
    var domain = inDomainsSetting(tab.url);
  } catch (e) {
    console.log(e);
    console.log("Couldn't evaluate inDomainsSetting");
    return;
  }

  // Switch off
  if (domain && domain in settingsLocal.domains) {
    // If off
    if (settingsLocal.domains[domain]["off"]) {
      if (settingsLocal.off_by_default) {
        switchOff(domain, tab.url, tabId, "bydefault");
      } else {
        switchOff(domain, tab.url, tabId, "normal");
      }
    }
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
    chrome.windows.get(tab.windowId, function(window) {
      if (window.focused) {
        timeline(domain, "tabs.onUpdated");
      }
    });
  }

  // Send favicon URL
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

// chrome.runtime.setUninstallURL("");
