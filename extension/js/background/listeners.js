try {
  eventLog("background.js loaded", "startup")

  function everySecond() {
    // Run the counter on the current domain
    domainTimeNudger()
    // Don't do anything else if currently idle
    var currentState = checkCurrentState()
    if (currentState.domain === chromeOrTabIdle) {
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
                  var domain = false
                  domain = domainCheck(window.tabs[i].url, settingsLocal)
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

  function onTabIdle(status, domain) {
    if (status) {
      timeline(chromeOrTabIdle, "onTabIdle")
    } else {
      timeline(domain, "onTabIdle")
    }
  }

  // Check whether new version is installed
  chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") {
      eventLog("install", "install") // seems weird
      // Show options page on install
      showOptionsPage = true
    } else if (details.reason == "update") {
      var thisVersion = chrome.runtime.getManifest().version
      eventLog(details.reason, details.reason, {
        previousVersion: details.previousVersion,
        thisVersion
      })
      // Show options page on install
      showOptionsPage = true
    }
  })

  // Tab closed, and tell about shutdown
  chrome.tabs.onRemoved.addListener(function(tabId) {
    if (typeof tabIdStorage[tabId] === undefined) {
      return
    } else {
      var tabRecord = tabIdStorage[tabId]
      var domain = domainCheck(tabRecord.url, settingsLocal)
      if (domain) {
        chrome.tabs.query({}, function(tabs) {
          // If no tabs with that domain now exist
          if (tabsChecker(tabs, domain)) {
            var statusObj = open("status")
            // Check lastVisitEnd
            var endTime = statusObj[domain].lastVisitEnd
            // Check lastShutdown
            var lastShutdown = statusObj[domain].lastShutdown
            // What does it mean if lastShutdown is undefined?
            // Means you should go ahead and mark that as a shutdown
            // What does it mean if lastVisitEnd is undefined? Should be impossible
            if (lastShutdown !== endTime) {
              dataAdder(statusObj, domain, endTime, "lastShutdown")

              // Shutdown happened so turn off site if off by default is on, even if snooze is on

              // Check not snoozing
              if (settingsLocal.off_by_default) {
                changeSetting(true, "domains", domain, "off")
              }

              close("status", statusObj, "status close in check off")
              eventLog(
                domain,
                "shutdown",
                {},
                moment().format("YYYY-MM-DD"),
                moment(endTime).format("HH:mm:ss")
              )
            }
          }
        })
      }
      delete tabIdStorage[tabId]
    }
  })

  // Helper function to check if any tabs match domain
  // Returns true if there were NO OTHER TABS with that domain
  function tabsChecker(tabs, domain) {
    for (var i = 0; i < tabs.length; i++) {
      // Believe running domainCheck in the if statement was causing a bug
      var tabDomain = domainCheck(tabs[i].url, settingsLocal)
      if (tabDomain === domain) {
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
  chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
    var domain = false
    if (details.parentFrameId === -1) {
      try {
        domain = domainCheck(details.url, settingsLocal)
        // Check for domain we care about, that's off, and for snoozing
        if (
          domain &&
          settingsLocal.domains[domain].off &&
          !(settingsLocal.snooze.all > +Date.now())
        ) {
          if (settingsLocal.off_by_default) {
            switchOff(domain, details.url, details.tabId, "bydefault")
          } else {
            switchOff(domain, details.url, details.tabId, "normal")
          }
        }
      } catch (e) {
        log(e)
      }
    }
  })

  // Add to timeline onStateChanged
  chrome.idle.onStateChanged.addListener(function(newState) {
    if (newState !== "active") {
      // switching this part off because onTabIdle can handle it on its own
      timeline(false, "Gone idle zZZzZzZZ")
    }
    if (newState === "active") {
      // FIXME: is triggering error when only chrome window is the background one
      chrome.windows.getLastFocused(function(window) {
        if (typeof window == "undefined" || window.focused === false) {
          // This may be the problem
          timeline(false, "idle.onStateChanged")
        } else {
          chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(
            tabs
          ) {
            var domain = domainCheck(tabs[0].url, settingsLocal)
            timeline(domain, "idle.onStateChanged")
          })
        }
      })
    }
  })

  // Add to timeline onActivated
  chrome.tabs.onActivated.addListener(function(activatedTab) {
    if (typeof activatedTab == "undefined") {
      return
    }
    try {
      chrome.tabs.get(activatedTab.tabId, function(tabDetails) {
        // Don't need check of whether tab is active, because it is by default
        try {
          var domain = domainCheck(tabDetails.url, settingsLocal)
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

  // Add to timeline window onFocusedChange
  chrome.windows.onFocusChanged.addListener(function() {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(
      tabs
    ) {
      var domain = false
      if (typeof tabs[0] !== "undefined") {
        try {
          domain = domainCheck(tabs[0].url, settingsLocal)
        } catch (e) {
          log(e)
          log("Couldn't evaluate domainCheck")
        }
        timeline(domain, "windows.onFocusedChanged")
      }
    })
  })

  // Add to tabIdStorage onCreated
  chrome.tabs.onCreated.addListener(function(tab) {
    // New record in tabIdStorage
    tabIdStorage[tab.id] = {
      url: tab.url,
      nudge: false
    }
  })

  // Add to timeline onUpdated
  // Update URL in tabIdStorage
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    try {
      var domain = domainCheck(tab.url, settingsLocal)
    } catch (e) {
      log(e)
      log("Couldn't evaluate domainCheck")
      return
    }

    // Switch off
    // if (domain && domain in settingsLocal.domains) {
    //   // If off
    //   if (settingsLocal.domains[domain]["off"]) {
    //     if (settingsLocal.off_by_default && settingsLocal.snooze.all > (+ Date.now())) {
    //       // Switch off no longer happens here
    //       // switchOff(domain, tab.url, tabId, "bydefault");
    //     } else {
    //       // Switch off no longer happens here
    //       // switchOff(domain, tab.url, tabId, "normal");
    //     }
    //   }
    // }

    // Update record in tabIdStorage
    if (typeof tabIdStorage[tabId] === "undefined") {
      tabIdStorage[tabId] = {
        url: tab.url,
        nudge: false
      }
    } else {
      tabIdStorage[tabId].url = tab.url
    }

    if (tab.active === true) {
      try {
        chrome.windows.get(tab.windowId, function(window) {
          if (window.focused) {
            timeline(domain, "tabs.onUpdated")
          }
        })
      } catch (e) {
        log(e)
      }
    }
  })
} catch (e) {
  log(e)
}
