function everySecond() {
  // Run the counter on the current domain
  domainCurrentTimeUpdater()
  // Don't do anything else if currently idle
  var currentState = checkCurrentState()
  if (currentState.domain === tabIdle || currentState.domain === chromeIdle) {
    return
  }
  // Don't do anything if no windows exist
  chrome.windows.getAll(null, function(windows) {
    if (windows.length === 0) {
      if (currentState.domain !== notInChrome) {
        timeline(notInChrome, "everySecond")
        return
      }
    } else {
      // Find out if there are any windows active, and if so grab the active tab
      chrome.windows.getLastFocused({ populate: true }, function(window) {
        // If no windows are focused, check if notInChrome, and if not, add notInChrome to timeline
        if (!window.focused) {
          if (currentState.domain !== notInChrome) {
            timeline(notInChrome, "everySecond")
            return
          }
        } else {
          // If a window is focused, find the active tab
          var foundActiveTab = false
          for (var i = 0; i < window.tabs.length; i++) {
            // Once found active tab, check if currentState is notInChrome, and if it is, add domain to timeline
            if (window.tabs[i].active) {
              foundActiveTab = true
              if (currentState.domain === notInChrome) {
                var domain = domainCheck(window.tabs[i].url, settingsLocal)
                timeline(domain, "everySecond")
              }
            }
          }
          if (!foundActiveTab) {
            log("Did not find an active tab")
          }
        }
      })
    }
  })
}

// Listener for tab idle
function onTabIdle(status, domain) {
  if (status) {
    timeline(tabIdle, "onTabIdle")
  } else {
    timeline(domain, "onTabIdle")
  }
}

// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason == "install") {
    eventLog("install", {}, moment())
    // Show options page on install
    showOptionsPage = true
  } else if (details.reason == "update") {
    var thisVersion = chrome.runtime.getManifest().version
    eventLog(
      "update",
      {
        previousVersion: details.previousVersion,
        thisVersion
      },
      moment()
    )
    // Show options page on install
    showOptionsPage = true
  }
})

var lastClosedTabId = false

// Tab closed, and tell about shutdown
// This is important for situations where a tab is closed when it's not currently in focus
chrome.tabs.onRemoved.addListener(function onRemoved(tabId) {
  lastClosedTabId = tabId
  // log(tabId)
  if (typeof tabIdStorage[tabId] === undefined) {
    // log("Major fail")
    // log(tabId)
    // log(tabIdStorage)
    return
  } else {
    // We need the information of the deleted tab
    var removedTab = tabIdStorage[tabId]
    var domain = domainCheck(removedTab.url, settingsLocal)
    // Check if the tab was inactive and whether we care about it
    var statusObj = open("status")
    // If the domain of the closed tab is not the same as the domain of the current tab from currentState, and if we care about that tab
    if (statusObj.currentState.domain !== domain && isNudgeDomain(domain)) {
      chrome.tabs.query({}, function(tabs) {
        // If no tabs with that domain now exist
        if (tabsChecker(tabs, domain)) {
          var statusObj = open("status")
          dataAdder(statusObj, domain, moment(), "lastShutdown")
          // Shutdown happened so turn off site if off by default is on, even if snooze is on
          if (settingsLocal.off_by_default) {
            changeSetting(true, "domains", domain, "off")
          }
          close("status", statusObj, "status close in check off")
          eventLog("shutdown", { domain }, moment())
        }
      })
    } else {
      // log(statusObj.currentState.domain)
      // log(domain)
    }
    delete tabIdStorage[tabId]
  }
})

// Helper function to check if any tabs match domain
// Returns true if there were NO OTHER TABS with that domain
function tabsChecker(tabs, domain) {
  for (var i = 0; i < tabs.length; i++) {
    var tabDomain = domainCheck(tabs[i].url, settingsLocal)
    if (tabDomain === domain && tabs[i].id !== lastClosedTabId) {
      return false
    }
  }
  return true
}

// When Chrome window closed
chrome.windows.onRemoved.addListener(function(windowId) {
  chrome.windows.getAll(null, function(windows) {
    if (windows.length === 0) {
      timeline(notInChrome, "chrome.windows.onRemoved")
    }
  })
})

// Switch off
chrome.webNavigation.onBeforeNavigate.addListener(function runOnBeforeNavigate(
  details
) {
  // We add this condition to prevent the mysterious runtime.lastError bug, which feels like a Chrome defect
  if (details.tabId in tabIdStorage) {
    // Prevent this from happening if config.offByDefault is not on
    if (details.parentFrameId === -1 && config.offByDefault) {
      try {
        var domain = domainCheck(details.url, settingsLocal)
        let dontNudge = checkSnoozeAndSchedule(settingsLocal)
        // Check for domain we care about, that's off, and for snoozing
        if (
          isNudgeDomain(domain) &&
          settingsLocal.domains[domain] &&
          settingsLocal.domains[domain].off &&
          !dontNudge
        ) {
          if (settingsLocal.off_by_default) {
            switchOff(domain, details.url, details.tabId, "bydefault")
          } else {
            switchOff(domain, details.url, details.tabId, "normal")
          }
        }
      } catch (e) {
        // log(e)
      }
    }
  }
})

// Add to timeline onStateChanged
chrome.idle.onStateChanged.addListener(function idleHandler(newState) {
  if (newState !== "active") {
    // switching this part off because onTabIdle can handle it on its own
    timeline(chromeIdle, "chrome.idle")
  }
  if (newState === "active") {
    chrome.windows.getLastFocused(function findLastFocusedWindow(window) {
      if (typeof window == "undefined" || window.focused === false) {
        // This may be the problem
        timeline(notInChrome, "idle.onStateChanged")
      } else {
        chrome.tabs.query(
          { active: true, lastFocusedWindow: true },
          function queryTab(tabs) {
            var domain = domainCheck(tabs[0].url, settingsLocal)
            timeline(domain, "idle.onStateChanged")
          }
        )
      }
    })
  }
})

// Add to timeline onActivated
chrome.tabs.onActivated.addListener(function findActivatedTab(activatedTab) {
  if (typeof activatedTab == "undefined") {
    return
  }
  try {
    chrome.tabs.get(activatedTab.tabId, function getActivatedTabDetails(
      tabDetails
    ) {
      // Don't need check of whether tab is active, because it is by default
      try {
        if (
          tabDetails.url === "" &&
          tabDetails.pendingUrl &&
          tabDetails.pendingUrl !== ""
        ) {
          var domain = domainCheck(tabDetails.pendingUrl, settingsLocal)
        } else {
          var domain = domainCheck(tabDetails.url, settingsLocal)
        }
      } catch (e) {
        log(e)
        log("Couldn't evaluate domainCheck")
      }
      timeline(domain, "tabs.onActivated")
    })
  } catch (e) {
    log(e)
  }
})

// Add to timeline window onFocusChanged
chrome.windows.onFocusChanged.addListener(function windowOnFocusChanged() {
  chrome.tabs.query(
    { active: true, lastFocusedWindow: true },
    function findActiveTab(tabs) {
      if (typeof tabs[0] !== "undefined") {
        try {
          var domain = domainCheck(tabs[0].url, settingsLocal)
        } catch (e) {
          log(e)
          log("Couldn't evaluate domainCheck")
        }

        let dontNudge = checkSnoozeAndSchedule(settingsLocal)
        if (
          // Check if the domain would have just been redirected to off page
          !(
            isNudgeDomain(domain) &&
            settingsLocal.domains[domain] &&
            settingsLocal.domains[domain].off &&
            !dontNudge
          )
        ) {
          timeline(domain, "windows.onFocusChanged")
        }
      }
    }
  )
})

// Stop autoplay feature
chrome.webRequest.onBeforeRequest.addListener(
  function(request) {
    if (settingsLocal.stop_autoplay) {
      const cancel =
        request.url.indexOf("watch_autoplayrenderer.js") !== -1 ||
        request.url.indexOf("endscreen.js") !== -1
      return { cancel }
    }
  },
  {
    urls: ["*://*.ytimg.com/yts/jsbin/*", "*://*.youtube.com/yts/jsbin/*"]
  },
  ["blocking"]
)

// Add to tabIdStorage onCreated
chrome.tabs.onCreated.addListener(function findCreatedTab(tab) {
  // New record in tabIdStorage
  tabIdStorage[tab.id] = tab
})

// Add to timeline onUpdated
// Update URL in tabIdStorage
chrome.tabs.onUpdated.addListener(function findUpdatedTab(
  tabId,
  changeInfo,
  tab
) {
  try {
    var domain = domainCheck(tab.url, settingsLocal)
  } catch (e) {
    log(e)
    log("Couldn't evaluate domainCheck")
    return
  }

  // Update record in tabIdStorage
  tabIdStorage[tabId] = tab

  if (tab.active === true) {
    try {
      chrome.windows.get(tab.windowId, function(window) {
        let dontNudge = checkSnoozeAndSchedule(settingsLocal)
        if (
          window.focused &&
          !(
            isNudgeDomain(domain) &&
            settingsLocal.domains[domain] &&
            settingsLocal.domains[domain].off &&
            !dontNudge
          )
        ) {
          timeline(domain, "tabs.onUpdated")
        }
      })
    } catch (e) {
      log(e)
    }
  }
})
